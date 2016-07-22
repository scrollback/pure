package chat.belong.hello.modules.google;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.support.v4.content.ContextCompat;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.common.GooglePlayServicesNotAvailableException;
import com.google.android.gms.common.GooglePlayServicesRepairableException;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.common.api.PendingResult;
import com.google.android.gms.common.api.ResultCallback;
import com.google.android.gms.common.api.Status;
import com.google.android.gms.location.places.AutocompleteFilter;
import com.google.android.gms.location.places.AutocompletePrediction;
import com.google.android.gms.location.places.AutocompletePredictionBuffer;
import com.google.android.gms.location.places.Place;
import com.google.android.gms.location.places.PlaceBuffer;
import com.google.android.gms.location.places.PlaceFilter;
import com.google.android.gms.location.places.PlaceLikelihood;
import com.google.android.gms.location.places.PlaceLikelihoodBuffer;
import com.google.android.gms.location.places.Places;
import com.google.android.gms.location.places.ui.PlaceAutocomplete;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.LatLngBounds;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;


public class GooglePlacesModule extends ReactContextBaseJavaModule implements ActivityEventListener {

    private static final String ERR_ACTIVITY_DOES_NOT_EXIST = "Activity doesn't exist";
    private static final String ERR_GOOGLE_API_NOT_INITIALIZED = "Google API client not initialized";
    private static final String ERR_PERMISSION_NOT_GRANTED = "Location permissions are not granted";
    private static final String ERR_PICKER_CANCELLED = "Places picker was cancelled";

    private static final String ERR_ACTIVITY_DOES_NOT_EXIST_CODE = "ERR_ACTIVITY_DOES_NOT_EXIST";
    private static final String ERR_GOOGLE_API_NOT_INITIALIZED_CODE = "ERR_GOOGLE_API_NOT_INITIALIZED";
    private static final String ERR_PERMISSION_NOT_GRANTED_CODE = "ERR_PERMISSION_NOT_GRANTED";
    private static final String ERR_PICKER_CANCELLED_CODE = "ERR_PICKER_CANCELLED";

    private static final int PLACE_AUTOCOMPLETE_REQUEST_CODE = 1090;
    private static final int LOCATION_PERMISSION_REQUEST_CODE = 1080;

    private Promise mPermissionPromise;
    private Promise mRetrievePromise;
    private GoogleApiManagerModule mGoogleApiManager;

    public GooglePlacesModule(ReactApplicationContext reactContext, GoogleApiManagerModule apiManagerModule) {
        super(reactContext);

        reactContext.addActivityEventListener(this);

        mGoogleApiManager = apiManagerModule;
    }

    @Override
    public String getName() {
        return "GooglePlacesModule";
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();

        // https://developers.google.com/places/android-api/autocomplete#get_place_predictions_programmatically
        constants.put("TYPE_FILTER_ADDRESS", AutocompleteFilter.TYPE_FILTER_ADDRESS);
        constants.put("TYPE_FILTER_CITIES", AutocompleteFilter.TYPE_FILTER_CITIES);
        constants.put("TYPE_FILTER_ESTABLISHMENT", AutocompleteFilter.TYPE_FILTER_ESTABLISHMENT);
        constants.put("TYPE_FILTER_GEOCODE", AutocompleteFilter.TYPE_FILTER_GEOCODE);
        constants.put("TYPE_FILTER_NONE", AutocompleteFilter.TYPE_FILTER_NONE);
        constants.put("TYPE_FILTER_REGIONS", AutocompleteFilter.TYPE_FILTER_REGIONS);

        return constants;
    }

    private void rejectPermissionPromise(String code, String reason) {
        if (mPermissionPromise != null) {
            mPermissionPromise.reject(code, reason);
            mPermissionPromise = null;
        }
    }

    private void resolveRetrivePromise(WritableMap map) {
        if (mRetrievePromise != null) {
            mRetrievePromise.resolve(map);
            mRetrievePromise = null;
        }
    }

    private void rejectRetrivePromise(Exception reason) {
        if (mRetrievePromise != null) {
            mRetrievePromise.reject(reason);
            mRetrievePromise = null;
        }
    }

    private void rejectRetrivePromise(String code, String reason) {
        if (mRetrievePromise != null) {
            mRetrievePromise.reject(code, reason);
            mRetrievePromise = null;
        }
    }

    @ReactMethod
    public void getCurrentPlace(@Nullable final ReadableMap filter, final Promise promise) {
        GoogleApiClient googleApiClient = mGoogleApiManager.getGoogleApiClient();

        if (googleApiClient == null || !googleApiClient.isConnected()) {
            promise.reject(ERR_GOOGLE_API_NOT_INITIALIZED_CODE, ERR_GOOGLE_API_NOT_INITIALIZED);
            return;
        }

        Activity currentActivity = getCurrentActivity();

        if (currentActivity == null) {
            promise.reject(ERR_ACTIVITY_DOES_NOT_EXIST_CODE, ERR_ACTIVITY_DOES_NOT_EXIST);
            return;
        }

        int permission = ContextCompat.checkSelfPermission(currentActivity, Manifest.permission.ACCESS_FINE_LOCATION);

        if (permission != PackageManager.PERMISSION_GRANTED) {
            promise.reject(ERR_PERMISSION_NOT_GRANTED_CODE, ERR_PERMISSION_NOT_GRANTED);
            return;
        }

        PlaceFilter placeFilter = null;

        if (filter != null) {
            Collection<String> restrictToPlaceIds = null;

            if (filter.hasKey("restrictToPlaceIds")) {
                restrictToPlaceIds = new ArrayList<>();
                ReadableArray placeIds = filter.getArray("restrictToPlaceIds");

                for (int i = 0, l = placeIds.size(); i < l; i++) {
                    restrictToPlaceIds.add(placeIds.getString(i));
                }
            }

            boolean requireOpenNow = filter.hasKey("requireOpenNow") && filter.getBoolean("requireOpenNow");

            placeFilter = new PlaceFilter(requireOpenNow, restrictToPlaceIds);
        }

        PendingResult<PlaceLikelihoodBuffer> result = Places.PlaceDetectionApi.getCurrentPlace(googleApiClient, placeFilter);

        result.setResultCallback(new ResultCallback<PlaceLikelihoodBuffer>() {
            @Override
            public void onResult(@NonNull PlaceLikelihoodBuffer placeLikelihoods) {
                WritableArray places = Arguments.createArray();

                for (PlaceLikelihood likelihood : placeLikelihoods) {
                    WritableMap details = Arguments.createMap();

                    details.putMap("place", buildPlacesMap(likelihood.getPlace()));
                    details.putDouble("likelihood", likelihood.getLikelihood());

                    places.pushMap(details);
                }

                promise.resolve(places);
                placeLikelihoods.release();
            }
        });
    }

    @ReactMethod
    public void getPlaceById(final String id, final Promise promise) {
        GoogleApiClient googleApiClient = mGoogleApiManager.getGoogleApiClient();

        if (googleApiClient == null || !googleApiClient.isConnected()) {
            promise.reject(ERR_GOOGLE_API_NOT_INITIALIZED_CODE, ERR_GOOGLE_API_NOT_INITIALIZED);
            return;
        }

        PendingResult<PlaceBuffer> result = Places.GeoDataApi.getPlaceById(googleApiClient, id);

        result.setResultCallback(new ResultCallback<PlaceBuffer>() {
            @Override
            public void onResult(@NonNull PlaceBuffer places) {
                promise.resolve(buildPlacesMap(places.get(0)));
                places.release();
            }
        });
    }

    @ReactMethod
    public void findPlace(final Promise promise) {
        GoogleApiClient googleApiClient = mGoogleApiManager.getGoogleApiClient();

        if (googleApiClient == null || !googleApiClient.isConnected()) {
            promise.reject(ERR_GOOGLE_API_NOT_INITIALIZED_CODE, ERR_GOOGLE_API_NOT_INITIALIZED);
            return;
        }

        Activity currentActivity = getCurrentActivity();

        if (currentActivity == null) {
            promise.reject(ERR_ACTIVITY_DOES_NOT_EXIST_CODE, ERR_ACTIVITY_DOES_NOT_EXIST);
            return;
        }

        mRetrievePromise = promise;

        try {
            Intent intent =
                    new PlaceAutocomplete.IntentBuilder(PlaceAutocomplete.MODE_OVERLAY)
                            .build(currentActivity);

            currentActivity.startActivityForResult(intent, PLACE_AUTOCOMPLETE_REQUEST_CODE);
        } catch (GooglePlayServicesRepairableException | GooglePlayServicesNotAvailableException e) {
            rejectRetrivePromise(e);
        }
    }

    @ReactMethod
    public void getAutoCompletePredictions(
            final String query, final ReadableArray bounds, @Nullable final ReadableArray filter,
            final Promise promise
    ) {
        GoogleApiClient googleApiClient = mGoogleApiManager.getGoogleApiClient();

        if (googleApiClient == null || !googleApiClient.isConnected()) {
            promise.reject(ERR_GOOGLE_API_NOT_INITIALIZED_CODE, ERR_GOOGLE_API_NOT_INITIALIZED);
            return;
        }

        LatLngBounds.Builder boundsBuilder = new LatLngBounds.Builder();

        for (int i = 0, l = bounds.size(); i < l; i++) {
            ReadableMap map = bounds.getMap(i);

            boundsBuilder.include(new LatLng(map.getDouble("latitude"), map.getDouble("longitude")));
        }

        LatLngBounds latLngBounds = boundsBuilder.build();

        AutocompleteFilter autoCompleteFilter = null;

        if (filter != null) {
            AutocompleteFilter.Builder filterBuilder = new AutocompleteFilter.Builder();

            for (int i = 0, l = filter.size(); i < l; i++) {
                filterBuilder.setTypeFilter(filter.getInt(i));
            }

            autoCompleteFilter = filterBuilder.build();
        }

        PendingResult<AutocompletePredictionBuffer> result =
                Places.GeoDataApi.getAutocompletePredictions(googleApiClient, query, latLngBounds, autoCompleteFilter);

        result.setResultCallback(new ResultCallback<AutocompletePredictionBuffer>() {
            @Override
            public void onResult(@NonNull AutocompletePredictionBuffer autocompletePredictions) {
                WritableArray predictions = Arguments.createArray();

                for (AutocompletePrediction prediction : autocompletePredictions) {
                    WritableMap details = Arguments.createMap();

                    details.putString("fullText", prediction.getFullText(null).toString());
                    details.putString("primaryText", prediction.getPrimaryText(null).toString());
                    details.putString("secondaryText", prediction.getSecondaryText(null).toString());
                    details.putString("placeId", prediction.getPlaceId());

                    WritableArray placeTypesArray = Arguments.createArray();
                    List<Integer> placeTypes = prediction.getPlaceTypes();

                    if (placeTypes != null) {
                        for (int item : placeTypes) {
                            placeTypesArray.pushInt(item);
                        }
                    }

                    details.putArray("placeTypes", placeTypesArray);

                    predictions.pushMap(details);
                }

                promise.resolve(predictions);
                autocompletePredictions.release();
            }
        });
    }

    private WritableMap buildPlacesMap(Place place) {
        CharSequence address = place.getAddress();
        CharSequence attributions = place.getAttributions();
        CharSequence name = place.getName();
        CharSequence phoneNumber = place.getPhoneNumber();
        Locale locale = place.getLocale();
        Uri websiteUri = place.getWebsiteUri();

        WritableMap map = Arguments.createMap();

        if (address != null) {
            map.putString("address", address.toString());
        }

        if (attributions != null) {
            map.putString("attributions", attributions.toString());
        }

        if (name != null) {
            map.putString("name", name.toString());
        }

        if (phoneNumber != null) {
            map.putString("phoneNumber", phoneNumber.toString());
        }

        if (locale != null) {
            map.putString("locale", locale.toString());
        }

        if (websiteUri != null) {
            map.putString("websiteUrl", websiteUri.toString());
        }

        map.putString("id", place.getId());
        map.putInt("priceLevel", place.getPriceLevel());
        map.putDouble("rating", place.getRating());

        WritableMap latLngMap = Arguments.createMap();
        LatLng latLng = place.getLatLng();

        latLngMap.putDouble("latitude", latLng.latitude);
        latLngMap.putDouble("longitude", latLng.longitude);

        map.putMap("latLng", latLngMap);

        WritableArray placeTypesArray = Arguments.createArray();
        List<Integer> placeTypes = place.getPlaceTypes();

        for (int item : placeTypes) {
            placeTypesArray.pushInt(item);
        }

        map.putArray("placeTypes", placeTypesArray);

        return map;
    }

    @Override
    public void onNewIntent(final Intent Intent) {
    }

    @Override
    public void onActivityResult(final int requestCode, final int resultCode, final Intent data) {
        switch (requestCode) {
            case PLACE_AUTOCOMPLETE_REQUEST_CODE:
                if (resultCode == Activity.RESULT_CANCELED) {
                    rejectRetrivePromise(ERR_PICKER_CANCELLED_CODE, ERR_PICKER_CANCELLED);
                } else if (resultCode == PlaceAutocomplete.RESULT_ERROR) {
                    Activity currentActivity = getCurrentActivity();

                    if (currentActivity != null) {
                        Status status = PlaceAutocomplete.getStatus(currentActivity, data);
                        rejectRetrivePromise("ERR_INVALID_STATUS", status.getStatusMessage());
                    } else {
                        rejectRetrivePromise(ERR_ACTIVITY_DOES_NOT_EXIST_CODE, ERR_ACTIVITY_DOES_NOT_EXIST);
                    }
                } else if (resultCode == Activity.RESULT_OK) {
                    Activity currentActivity = getCurrentActivity();

                    if (currentActivity != null) {
                        resolveRetrivePromise(buildPlacesMap(PlaceAutocomplete.getPlace(currentActivity, data)));
                    } else {
                        rejectRetrivePromise(ERR_ACTIVITY_DOES_NOT_EXIST_CODE, ERR_ACTIVITY_DOES_NOT_EXIST);
                    }

                }
                break;
            case LOCATION_PERMISSION_REQUEST_CODE:
                if (resultCode == Activity.RESULT_CANCELED) {
                    rejectPermissionPromise(ERR_PERMISSION_NOT_GRANTED_CODE, ERR_PERMISSION_NOT_GRANTED);
                } else if (resultCode == PlaceAutocomplete.RESULT_ERROR) {
                    rejectPermissionPromise(ERR_PERMISSION_NOT_GRANTED_CODE, ERR_PERMISSION_NOT_GRANTED);
                } else if (resultCode == Activity.RESULT_OK) {
                    Activity currentActivity = getCurrentActivity();

                    if (currentActivity != null) {
                        resolveRetrivePromise(buildPlacesMap(PlaceAutocomplete.getPlace(currentActivity, data)));
                    } else {
                        rejectRetrivePromise(ERR_ACTIVITY_DOES_NOT_EXIST_CODE, ERR_ACTIVITY_DOES_NOT_EXIST);
                    }

                }
                break;
        }
    }
}
