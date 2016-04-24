package chat.belong.hello.modules.google;

import android.app.Activity;
import android.support.annotation.Nullable;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.google.android.gms.auth.api.Auth;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.places.Places;

import chat.belong.hello.R;

public class GoogleApiManagerModule extends ReactContextBaseJavaModule implements LifecycleEventListener {

    private GoogleApiClient mGoogleApiClient;
    private GoogleSignInOptions gso;

    public GoogleApiManagerModule(ReactApplicationContext reactContext) {
        super(reactContext);

        reactContext.addLifecycleEventListener(this);

        gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestEmail()
                .requestIdToken(reactContext.getString(R.string.server_client_id))
                .build();
    }

    @Override
    public String getName() {
        return "GoogleSignInModule";
    }

    public @Nullable GoogleApiClient getGoogleApiClient() {
        return mGoogleApiClient;
    }

    private void initializeGoogleApi() {
        Activity currentActivity = getCurrentActivity();

        if (currentActivity != null) {
            mGoogleApiClient = new GoogleApiClient
                    .Builder(currentActivity)
                    .addApi(LocationServices.API)
                    .addApi(Places.GEO_DATA_API)
                    .addApi(Places.PLACE_DETECTION_API)
                    .addApi(Auth.GOOGLE_SIGN_IN_API, gso)
                    .build();
        }
    }

    @Override
    public void onHostResume() {
        if (mGoogleApiClient == null) {
            initializeGoogleApi();
        }

        mGoogleApiClient.connect();
    }

    @Override
    public void onHostPause() {
        mGoogleApiClient.disconnect();
    }

    @Override
    public void onHostDestroy() {
    }
}
