package chat.belong.hello.bundle;

import android.content.res.AssetManager;
import android.os.Handler;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.security.NoSuchAlgorithmException;

import chat.belong.hello.BuildConfig;

public class JSBundleManager {

    private static final String TAG = "JSBundleManager";

    private static final String PROP_FILENAME = "filename";
    private static final String PROP_ASSETS = "assets";
    private static final String PROP_VERSION_NAME = "version_name";
    private static final String PROP_CHECKSUM_MD5 = "checksum_md5";

    private final Boolean mEnabled;
    private final String mBundleAssetName;
    private final String mMetadataName;
    private final String mRequestPath;
    private final AssetManager mAssetManager;
    private final Callback mCallback;
    private final File assetDir;
    private final File tmpDir;

    JSBundleManager(@NonNull String bundleAssetName, @NonNull String metadataName, @NonNull String requestPath,
                    @NonNull File cacheDir, @NonNull AssetManager assetManager,
                    @Nullable Callback callback, @Nullable Boolean enabled) {

        mBundleAssetName = bundleAssetName;
        mMetadataName = metadataName;
        mRequestPath = requestPath;
        mAssetManager = assetManager;
        mCallback = callback;
        mEnabled = enabled;

        assetDir = new File(cacheDir, "assets");
        tmpDir = new File(cacheDir, "tmp");
    }

    public String getJSBundleFile() {

        File assetFile = new File(assetDir, mBundleAssetName);

        if (assetFile.exists()) {
            File metadataFile = new File(assetDir, mMetadataName);

            if (metadataFile.exists()) {
                try {
                    JSONObject metadata = new JSONObject(IOHelpers.getStringFromFile(metadataFile));

                    if (BuildConfig.VERSION_NAME.equals(metadata.getString(PROP_VERSION_NAME))) {
                        if (mCallback != null) {
                            mCallback.onCached();
                        }

                        return assetFile.getAbsolutePath();
                    }

                    Log.d(TAG, "Deleting obsolete cache");

                    IOHelpers.deleteDirectory(assetDir);
                } catch (IOException | JSONException e) {
                    Log.e(TAG, "Error reading metadata", e);
                }

            }
        }

        return "assets://" + mBundleAssetName;
    }

    public JSBundleManager checkUpdate() {
        if (mEnabled == null || mEnabled) {
            new Thread(new Runnable() {
                @Override
                public void run() {
                    checkAndDownloadUpdate();
                }
            }).start();
        }

        return this;
    }

    public JSBundleManager checkUpdate(long delay) {
        final Handler handler = new Handler();

        handler.postDelayed(new Runnable() {
            @Override
            public void run() {
                checkUpdate();
            }
        }, delay);

        return this;
    }

    private boolean hasBundleChanged(JSONObject metadata) throws IOException, JSONException, NoSuchAlgorithmException {
        InputStream in;
        File assetFile = new File(assetDir, mBundleAssetName);

        if (assetFile.exists()) {
            in = new FileInputStream(assetFile);
        } else {
            in = mAssetManager.open(mBundleAssetName);
        }

        try {
            // Check if MD5 has changed
            String updateChecksum = metadata.getString(PROP_CHECKSUM_MD5);
            String currentChecksum = Checksum.MD5(in);

            if (updateChecksum.equals(currentChecksum)) {
                return false;
            }
        } finally {
            in.close();
        }

        return true;
    }

    private boolean hasMetadataChanged(JSONObject metadata) throws IOException, JSONException {
        File metadataFile = new File(assetDir, mMetadataName);

        return metadataFile.exists() && !(metadata.toString().equals(new JSONObject(IOHelpers.getStringFromFile(metadataFile)).toString()));
    }

    private boolean shouldDownloadBundle(JSONObject metadata) throws IOException, JSONException, NoSuchAlgorithmException {
        if (hasMetadataChanged(metadata)) {
            Log.d(TAG, "Metadata change detected");
            return true;
        }

        if (hasBundleChanged(metadata)) {
            Log.d(TAG, "Bundle change detected");
            return true;
        }

        Log.d(TAG, "Everything is up-to-date");
        return false;
    }

    private JSONObject fetchMetadata() throws IOException, JSONException {
        return new JSONObject(IOHelpers.getStringFromFile(downloadFile(mMetadataName, null)));
    }

    private File downloadFile(String sourceFileName, @Nullable String downloadFileName) throws IOException {
        URL url = new URL(mRequestPath + "/" + sourceFileName);
        File file = new File(tmpDir, downloadFileName == null ? sourceFileName : downloadFileName);

        Log.d(TAG, "Downloading " + url + " to " + file.getAbsolutePath());

        return IOHelpers.saveStream(new BufferedInputStream(url.openStream()), file);
    }

    private File downloadAndVerifyFile(JSONObject metadata, @Nullable String target) throws IOException, JSONException, NoSuchAlgorithmException {
        String fileName = metadata.getString(PROP_FILENAME);
        File file = downloadFile(fileName, target);

        Log.d(TAG, "Verifying downloaded file: " + fileName);

        String updateChecksum = metadata.getString(PROP_CHECKSUM_MD5);
        String currentChecksum = Checksum.MD5(file);

        if (!updateChecksum.equals(currentChecksum)) {
            throw new IOException("MD5 checksums don't match: " + updateChecksum + " != " + currentChecksum);
        }

        return file;
    }

    private void downloadBundleAndAssets(JSONObject metadata) throws IOException, JSONException, NoSuchAlgorithmException {
        downloadAndVerifyFile(metadata, mBundleAssetName);

        JSONArray assetsList = metadata.getJSONArray(PROP_ASSETS);

        for (int i = 0; i < assetsList.length(); i++) {
            downloadAndVerifyFile(assetsList.getJSONObject(i), null);
        }
    }

    private void checkAndDownloadUpdate() {
        Log.d(TAG, "Checking for updates");

        if (mCallback != null) {
            mCallback.onChecking();
        }

        try {
            JSONObject metadata = fetchMetadata();

            if (shouldDownloadBundle(metadata)) {
                Log.d(TAG, "Update available");

                if (mCallback != null) {
                    mCallback.onDownloading();
                }

                downloadBundleAndAssets(metadata);

                IOHelpers.deleteDirectory(assetDir);
                IOHelpers.copyFiles(tmpDir, assetDir);

                Log.d(TAG, "Finished copying files");

                if (mCallback != null) {
                    mCallback.onUpdateReady();
                }
            } else {
                if (mCallback != null) {
                    mCallback.onNoUpdate();
                }
            }
        } catch (IOException | JSONException | NoSuchAlgorithmException e) {
            Log.e(TAG, "Error during update", e);

            if (mCallback != null) {
                mCallback.onError(e);
            }
        } finally {
            IOHelpers.deleteDirectory(tmpDir);
        }
    }

    public interface Callback {
        void onCached();

        void onChecking();

        void onDownloading();

        void onError(Exception e);

        void onNoUpdate();

        void onUpdateReady();
    }

    public static class Builder {

        private String mBundleAssetName;
        private String mMetadataName;
        private String mRequestPath;
        private File mCacheDir;
        private AssetManager mAssetmanager;
        private Callback mCallback;
        private Boolean mEnabled;

        public Builder setEnabled(@Nullable final Boolean enabled) {
            mEnabled = enabled;

            return this;
        }

        public Builder setBundleAssetName(@NonNull final String bundleAssetName) {
            mBundleAssetName = bundleAssetName;

            return this;
        }

        public Builder setMetadataName(@NonNull final String metadataName) {
            mMetadataName = metadataName;

            return this;
        }

        public Builder setRequestPath(@NonNull final String requestPath) {
            mRequestPath = requestPath;

            return this;
        }

        public Builder setCacheDir(@NonNull final File cacheDir) {
            mCacheDir = cacheDir;

            return this;
        }

        public Builder setAssetManager(@NonNull final AssetManager assetManager) {
            mAssetmanager = assetManager;

            return this;
        }

        public Builder setCallback(@Nullable final Callback callback) {
            mCallback = callback;

            return this;
        }

        public JSBundleManager build() {
            return new JSBundleManager(mBundleAssetName, mMetadataName, mRequestPath, mCacheDir, mAssetmanager, mCallback, mEnabled);
        }
    }
}
