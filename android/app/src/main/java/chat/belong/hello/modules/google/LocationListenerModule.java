package chat.belong.hello.modules.google;

import android.app.Activity;
import android.content.Intent;
import android.content.IntentSender;
import android.location.Location;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.common.api.PendingResult;
import com.google.android.gms.common.api.ResultCallback;
import com.google.android.gms.common.api.Status;
import com.google.android.gms.location.LocationListener;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.LocationSettingsRequest;
import com.google.android.gms.location.LocationSettingsResult;
import com.google.android.gms.location.LocationSettingsStatusCodes;

public class LocationListenerModule extends ReactContextBaseJavaModule implements ActivityEventListener {

    private static final String ERR_ACTIVITY_DOES_NOT_EXIST = "Activity doesn't exist";
    private static final String ERR_GOOGLE_API_NOT_INITIALIZED = "Google API client not initialized";
    private static final String ERR_SETTINGS_CHANGE_UNAVAILABLE = "Unable to change GPS settings";
    private static final String ERR_PROMPT_CANCELED = "Permission request was canceled";
    private static final String ERR_NO_LAST_LOCATION = "No last known location found";

    private static final String ERR_ACTIVITY_DOES_NOT_EXIST_CODE = "ERR_ACTIVITY_DOES_NOT_EXIST";
    private static final String ERR_GOOGLE_API_NOT_INITIALIZED_CODE = "ERR_GOOGLE_API_NOT_INITIALIZED";
    private static final String ERR_SETTINGS_CHANGE_UNAVAILABLE_CODE = "ERR_SETTINGS_CHANGE_UNAVAILABLE";
    private static final String ERR_PROMPT_CANCELED_CODE = "ERR_PROMPT_CANCELED";
    private static final String ERR_NO_LAST_LOCATION_CODE = "ERR_NO_LAST_LOCATION";

    private static final int LOCATION_PROMPT_REQUEST_CODE = 1170;

    private Promise mPromptPromise;
    private GoogleApiManagerModule mGoogleApiManager;

    private final LocationListener mLocationListener = new LocationListener() {
        @Override
        public void onLocationChanged(Location location) {
            sendLocationUpdate(location);
        }
    };

    public LocationListenerModule(ReactApplicationContext reactContext, GoogleApiManagerModule apiManagerModule) {
        super(reactContext);

        reactContext.addActivityEventListener(this);

        mGoogleApiManager = apiManagerModule;
    }

    @Override
    public String getName() {
        return "LocationListenerModule";
    }

    private void resolvePromptPromise(boolean value) {
        if (mPromptPromise != null) {
            mPromptPromise.resolve(value);
            mPromptPromise = null;
        }
    }

    private void rejectPromptPromise(String code, String reason) {
        if (mPromptPromise != null) {
            mPromptPromise.reject(code, reason);
            mPromptPromise = null;
        }
    }

    private void rejectPromptPromise(Exception reason) {
        if (mPromptPromise != null) {
            mPromptPromise.reject(reason);
            mPromptPromise = null;
        }
    }

    private void sendLocationUpdate(Location location) {
        getReactApplicationContext()
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("locationListenerUpdate", buildLocationMap(location));
    }

    private void sendLocationError(String error) {
        getReactApplicationContext()
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("locationListenerError", error);
    }

    private WritableMap buildLocationMap(final Location loc) {
        WritableMap coords = Arguments.createMap();

        coords.putDouble("latitude", loc.getLatitude());
        coords.putDouble("longitude", loc.getLongitude());
        coords.putDouble("altitude", loc.getAltitude());
        coords.putDouble("accuracy", loc.getAccuracy());
        coords.putDouble("speed", loc.getSpeed());

        WritableMap map = Arguments.createMap();

        map.putMap("coords", coords);
        map.putDouble("timestamp", loc.getTime());

        return map;
    }

    private LocationRequest buildLocationRequest(final ReadableMap options) {
        int priority = LocationRequest.PRIORITY_LOW_POWER;

        LocationRequest locationRequest = LocationRequest.create();

        if (options != null) {
            if (options.hasKey("priority")) {
                switch (options.getString("priority")) {
                    case "high_accuracy":
                        priority = LocationRequest.PRIORITY_HIGH_ACCURACY;
                        break;
                    case "balanced_power":
                        priority = LocationRequest.PRIORITY_BALANCED_POWER_ACCURACY;
                        break;
                    case "low_power":
                        priority = LocationRequest.PRIORITY_LOW_POWER;
                        break;
                    default:
                        priority = LocationRequest.PRIORITY_NO_POWER;
                }
            }

            if (options.hasKey("interval")) {
                locationRequest.setInterval(options.getInt("interval"));
            }

            if (options.hasKey("timeout")) {
                locationRequest.setMaxWaitTime(options.getInt("timeout"));
            }

            if (options.hasKey("frequency")) {
                locationRequest.setNumUpdates(options.getInt("frequency"));
            }

            if (options.hasKey("displacement")) {
                locationRequest.setSmallestDisplacement((float) options.getDouble("displacement"));
            }
        }

        locationRequest.setPriority(priority);

        return locationRequest;
    }

    @ReactMethod
    public void requestEnableLocation(@Nullable final ReadableMap options, final Promise promise) {
        GoogleApiClient googleApiClient = mGoogleApiManager.getGoogleApiClient();

        if (googleApiClient == null || !googleApiClient.isConnected()) {
            promise.reject(ERR_GOOGLE_API_NOT_INITIALIZED_CODE, ERR_GOOGLE_API_NOT_INITIALIZED);
            return;
        }

        final Activity currentActivity = getCurrentActivity();

        if (currentActivity == null) {
            rejectPromptPromise(ERR_ACTIVITY_DOES_NOT_EXIST_CODE, ERR_ACTIVITY_DOES_NOT_EXIST);
            return;
        }

        LocationRequest locationRequest = buildLocationRequest(options);

        LocationSettingsRequest request = new LocationSettingsRequest.Builder()
                .addLocationRequest(locationRequest)
                .setAlwaysShow(true)
                .build();

        PendingResult<LocationSettingsResult> result =
                LocationServices.SettingsApi.checkLocationSettings(googleApiClient, request);

        result.setResultCallback(new ResultCallback<LocationSettingsResult>() {
            @Override
            public void onResult(@NonNull LocationSettingsResult result) {
                final Status status = result.getStatus();

                switch (status.getStatusCode()) {
                    case LocationSettingsStatusCodes.SUCCESS:
                        promise.resolve(true);
                        break;
                    case LocationSettingsStatusCodes.SETTINGS_CHANGE_UNAVAILABLE:
                        promise.reject(ERR_SETTINGS_CHANGE_UNAVAILABLE_CODE, ERR_SETTINGS_CHANGE_UNAVAILABLE);
                        break;
                    case LocationSettingsStatusCodes.RESOLUTION_REQUIRED:
                        mPromptPromise = promise;

                        try {
                            status.startResolutionForResult(currentActivity, LOCATION_PROMPT_REQUEST_CODE);
                        } catch (IntentSender.SendIntentException e) {
                            rejectPromptPromise(e);
                        }
                        break;
                }
            }
        });
    }

    @ReactMethod
    public void getLastLocation(final Promise promise) {
        GoogleApiClient googleApiClient = mGoogleApiManager.getGoogleApiClient();

        if (googleApiClient == null || !googleApiClient.isConnected()) {
            promise.reject(ERR_GOOGLE_API_NOT_INITIALIZED_CODE, ERR_GOOGLE_API_NOT_INITIALIZED);
            return;
        }
        
        Location location = LocationServices.FusedLocationApi.getLastLocation(googleApiClient);

        if (location != null) {
            promise.resolve(buildLocationMap(location));
        } else {
            promise.reject(ERR_NO_LAST_LOCATION_CODE, ERR_NO_LAST_LOCATION);
        }
    }

    @ReactMethod
    public void startWatching(final ReadableMap options) {
        GoogleApiClient googleApiClient = mGoogleApiManager.getGoogleApiClient();

        if (googleApiClient == null || !googleApiClient.isConnected()) {
            sendLocationError(ERR_GOOGLE_API_NOT_INITIALIZED);
            return;
        }
        
        LocationServices.FusedLocationApi.requestLocationUpdates(
                googleApiClient, buildLocationRequest(options), mLocationListener);
    }

    @ReactMethod
    public void stopWatching() {
        GoogleApiClient googleApiClient = mGoogleApiManager.getGoogleApiClient();

        if (googleApiClient == null || !googleApiClient.isConnected()) {
            sendLocationError(ERR_GOOGLE_API_NOT_INITIALIZED);
            return;
        }
        
        LocationServices.FusedLocationApi.removeLocationUpdates(googleApiClient, mLocationListener);
    }

    @Override
    public void onActivityResult(final int requestCode, final int resultCode, final Intent data) {
        switch (requestCode) {
            case LOCATION_PROMPT_REQUEST_CODE:
                if (resultCode == Activity.RESULT_CANCELED) {
                    rejectPromptPromise(ERR_PROMPT_CANCELED_CODE, ERR_PROMPT_CANCELED);
                } else if (resultCode == Activity.RESULT_OK) {
                    resolvePromptPromise(true);
                }

        }
    }
}