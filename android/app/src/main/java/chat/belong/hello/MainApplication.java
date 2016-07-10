package chat.belong.hello;

import android.app.Application;

import com.crashlytics.android.Crashlytics;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.imagechooser.ImageChooserPackage;

import java.util.Arrays;
import java.util.List;

import chat.belong.hello.bundle.JSBundleManager;
import chat.belong.hello.modules.analytics.AnalyticsPackage;
import chat.belong.hello.modules.contacts.ContactsPackage;
import chat.belong.hello.modules.core.CorePackage;
import chat.belong.hello.modules.facebook.FacebookPackage;
import chat.belong.hello.modules.gcm.GCMPackage;
import chat.belong.hello.modules.google.GooglePackage;
import chat.belong.hello.modules.network.NetworkingPackage;
import io.fabric.sdk.android.Fabric;

public class MainApplication extends Application implements ReactApplication {

    @Override
    public void onCreate() {
        super.onCreate();

        Fabric.with(this, new Crashlytics());
        AppState.init(this);
    }

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {

        @Override
        protected String getJSBundleFile() {
            return new JSBundleManager.Builder()
                    .setBundleAssetName("index.android.bundle")
                    .setMetadataName("metadata.json")
                    .setRequestPath(
                            getString(R.string.app_protocol) + "//" +
                            getString(R.string.app_host) + "/s/bundles/android/" + BuildConfig.VERSION_NAME)
                    .setCacheDir(getCacheDir())
                    .setAssetManager(getAssets())
                    .setEnabled(!BuildConfig.DEBUG)
                    .build()
                    .checkUpdate(5000)
                    .getJSBundleFile();
        }

        @Override
        protected boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.asList(
                    new MainReactPackage(),
                    new NetworkingPackage(),
                    new CorePackage(),
                    new GCMPackage(),
                    new ContactsPackage(),
                    new GooglePackage(),
                    new AnalyticsPackage(),
                    new FacebookPackage(),
                    new ImageChooserPackage()
            );
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }
}
