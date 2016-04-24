package chat.belong.hello.modules.google;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.support.annotation.NonNull;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.auth.api.Auth;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInResult;
import com.google.android.gms.auth.api.signin.GoogleSignInStatusCodes;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.common.api.ResultCallback;
import com.google.android.gms.common.api.Status;


public class GoogleSignInModule extends ReactContextBaseJavaModule implements ActivityEventListener {

    private static final String ACTIVITY_DOES_NOT_EXIST_ERROR = "Activity doesn't exist";
    private static final String SIGNOUT_FAILED_ERROR = "Sign out failed";
    private static final String API_CLIENT_NOT_INITIALIZED_ERROR = "Google API client is not initialized";

    private static final int REQUEST_CODE_SIGN_IN = 3454;

    private Promise mSignInPromise;
    private GoogleApiManagerModule mGoogleApiManager;

    public GoogleSignInModule(ReactApplicationContext reactContext, GoogleApiManagerModule apiManagerModule) {
        super(reactContext);

        reactContext.addActivityEventListener(this);

        mGoogleApiManager = apiManagerModule;
    }

    @Override
    public String getName() {
        return "GoogleSignInModule";
    }

    private void resolveSignInPromise(WritableMap map) {
        if (mSignInPromise != null) {
            mSignInPromise.resolve(map);
            mSignInPromise = null;
        }
    }

    private void rejectSignInPromise(String reason) {
        if (mSignInPromise != null) {
            mSignInPromise.reject(reason);
            mSignInPromise = null;
        }
    }

    @ReactMethod
    public void signIn(final Promise promise) {
        GoogleApiClient googleApiClient = mGoogleApiManager.getGoogleApiClient();

        if (googleApiClient != null && googleApiClient.isConnected()) {
            Activity currentActivity = getCurrentActivity();

            if (currentActivity != null) {
                mSignInPromise = promise;

                Intent signInIntent = Auth.GoogleSignInApi.getSignInIntent(googleApiClient);
                currentActivity.startActivityForResult(signInIntent, REQUEST_CODE_SIGN_IN);
            } else {
                promise.reject(ACTIVITY_DOES_NOT_EXIST_ERROR);
            }
        } else {
            promise.reject(API_CLIENT_NOT_INITIALIZED_ERROR);
        }
    }

    @ReactMethod
    public void signOut(final Promise promise) {
        GoogleApiClient googleApiClient = mGoogleApiManager.getGoogleApiClient();

        if (googleApiClient != null && googleApiClient.isConnected()) {
            Auth.GoogleSignInApi.signOut(googleApiClient).setResultCallback(
                    new ResultCallback<Status>() {
                        @Override
                        public void onResult(@NonNull Status status) {
                            if (status.isSuccess()) {
                                promise.resolve(true);
                            } else {
                                promise.reject(SIGNOUT_FAILED_ERROR);
                            }
                        }
                    });
        } else {
            promise.reject(API_CLIENT_NOT_INITIALIZED_ERROR);
        }
    }

    @ReactMethod
    public void revokeAccess(final Promise promise) {
        GoogleApiClient googleApiClient = mGoogleApiManager.getGoogleApiClient();

        if (googleApiClient != null && googleApiClient.isConnected()) {
            Auth.GoogleSignInApi.revokeAccess(googleApiClient).setResultCallback(
                    new ResultCallback<Status>() {
                        @Override
                        public void onResult(@NonNull Status status) {
                            if (status.isSuccess()) {
                                promise.resolve(true);
                            } else {
                                promise.reject(SIGNOUT_FAILED_ERROR);
                            }
                        }
                    });
        } else {
            promise.reject(API_CLIENT_NOT_INITIALIZED_ERROR);
        }
    }

    @Override
    public void onActivityResult(final int requestCode, final int resultCode, final Intent data) {
        if (requestCode == REQUEST_CODE_SIGN_IN) {
            GoogleSignInResult result = Auth.GoogleSignInApi.getSignInResultFromIntent(data);
            GoogleSignInAccount account = result.getSignInAccount();

            if (result.isSuccess() && account != null) {
                WritableMap accountMap = Arguments.createMap();

                accountMap.putString("id", account.getId());
                accountMap.putString("display_name", account.getDisplayName());
                accountMap.putString("email", account.getEmail());
                accountMap.putString("id_token", account.getIdToken());
                accountMap.putString("auth_code", account.getServerAuthCode());

                Uri photo = account.getPhotoUrl();

                if (photo != null) {
                    accountMap.putString("photo_url", photo.toString());
                }

                resolveSignInPromise(accountMap);
            } else {
                rejectSignInPromise(GoogleSignInStatusCodes.getStatusCodeString(result.getStatus().getStatusCode()));
            }
        }
    }
}
