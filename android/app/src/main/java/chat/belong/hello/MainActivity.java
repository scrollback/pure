package chat.belong.hello;

import android.os.Bundle;
import android.os.Handler;
import android.support.v4.content.ContextCompat;
import android.util.Log;

import com.facebook.appevents.AppEventsLogger;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactPackage;
import com.facebook.react.ReactRootView;
import com.facebook.react.shell.MainReactPackage;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GoogleApiAvailability;
import com.imagechooser.ImageChooserPackage;

import java.util.Arrays;
import java.util.List;

import chat.belong.hello.bundle.JSBundleManager;
import chat.belong.hello.modules.analytics.AnalyticsPackage;
import chat.belong.hello.modules.contacts.ContactsPackage;
import chat.belong.hello.modules.core.CorePackage;
import chat.belong.hello.modules.facebook.FacebookPackage;
import chat.belong.hello.modules.gcm.GCMPackage;
import chat.belong.hello.modules.gcm.GCMRegistrationManager;
import chat.belong.hello.modules.google.GooglePackage;


public class MainActivity extends ReactActivity {

    GCMRegistrationManager mRegistrationManager = new GCMRegistrationManager(this);

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (checkPlayServices()) {
            mRegistrationManager.startIntentService();
        }
    }

    @Override
    protected ReactRootView createRootView() {
        final ReactRootView view = new ReactRootView(this);

        view.setBackgroundColor(ContextCompat.getColor(this, R.color.primary));

        final Handler handler = new Handler();

        handler.postDelayed(new Runnable() {
            @Override
            public void run() {
                view.setBackgroundColor(0);
            }
        }, 3000);

        return view;
    }

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
    protected String getMainComponentName() {
        return "Belong";
    }

    @Override
    protected List<ReactPackage> getPackages() {
        return Arrays.asList(
                new MainReactPackage(),
                new CorePackage(),
                new GCMPackage(),
                new ContactsPackage(),
                new GooglePackage(),
                new AnalyticsPackage(),
                new FacebookPackage(),
                new ImageChooserPackage()
        );
    }

    @Override
    protected boolean getUseDeveloperSupport() {
        return BuildConfig.DEBUG;
    }

    @Override
    protected void onPause() {
        mRegistrationManager.unRegisterReciever();
        super.onPause();
        AppEventsLogger.deactivateApp(this);
    }

    @Override
    protected void onResume() {
        super.onResume();
        mRegistrationManager.registerReceiver();
        AppEventsLogger.activateApp(this);
    }


    private boolean checkPlayServices() {
        GoogleApiAvailability apiAvailability = GoogleApiAvailability.getInstance();
        int resultCode = apiAvailability.isGooglePlayServicesAvailable(this);
        if (resultCode != ConnectionResult.SUCCESS) {
            if (apiAvailability.isUserResolvableError(resultCode)) {
                apiAvailability.getErrorDialog(this, resultCode, 9000)
                        .show();
            } else {
                Log.d("MainActivity", "This device is not supported.");
                finish();
            }
            return false;
        }
        return true;
    }
}
