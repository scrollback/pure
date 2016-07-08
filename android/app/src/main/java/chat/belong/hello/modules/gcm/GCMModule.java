package chat.belong.hello.modules.gcm;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;

import org.json.JSONArray;
import org.json.JSONObject;


public class GCMModule extends ReactContextBaseJavaModule {

    public GCMModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "GCMModule";
    }

    @ReactMethod
    public void configureSchema(final ReadableMap schema, final Promise promise) {
        try {
            GCMPreferences.configureSchema(getReactApplicationContext(), JSONUtils.readableMapToJson(schema));
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void configureNotification(final ReadableMap appearance, final Promise promise) {
        try {
            GCMPreferences.configureNotification(getReactApplicationContext(), JSONUtils.readableMapToJson(appearance));
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void configureFields(final ReadableMap fields, final Promise promise) {
        try {
            GCMPreferences.configureFields(getReactApplicationContext(), JSONUtils.readableMapToJson(fields));
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void setSessionID(final String sessionID) {
        GCMPreferences.setSessionID(getReactApplicationContext(), sessionID);
    }

    @ReactMethod
    public void enableNotifications() {
        GCMPreferences.enableNotifications(getReactApplicationContext());
    }

    @ReactMethod
    public void disableNotifications() {
        GCMPreferences.disableNotifications(getReactApplicationContext());
    }

    @ReactMethod
    public void isNotificationsEnabled(Promise promise) {
        boolean value = GCMPreferences.isNotificationsEnabled(getReactApplicationContext());
        promise.resolve(value);
    }

    @ReactMethod
    public void getCurrentNotifications(final Promise promise) {
        try {
            WritableArray result = Arguments.createArray();
            JSONArray items = GCMPreferences.getCurrentNotifications(getReactApplicationContext());

            for (int i = 0; i < items.length(); i++) {
                JSONObject item = items.getJSONObject(i);
                result.pushMap(JSONUtils.jsonToWritableMap(item));
            }

            promise.resolve(result);
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void clearCurrentNotifications() {
        GCMPreferences.clearCurrentNotifications(getReactApplicationContext());
    }

    @ReactMethod
    public void getRegistrationToken(final Promise promise) {
        String token = GCMPreferences.getRegistrationToken(getReactApplicationContext());
        promise.resolve(token);
    }
}
