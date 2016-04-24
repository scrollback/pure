package chat.belong.hello.modules.gcm;

import android.content.SharedPreferences;
import android.support.annotation.Nullable;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class GCMPreferencesModule extends ReactContextBaseJavaModule {

    public GCMPreferencesModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "GCMPreferencesModule";
    }

    @ReactMethod
    public void getRegistrationToken(final Promise promise) {
        promise.resolve(GCMPreferences.get(getReactApplicationContext()).getString(GCMPreferences.TOKEN, ""));
    }

    @ReactMethod
    public void saveSession(@Nullable final String session) {
        SharedPreferences.Editor e = GCMPreferences.get(getReactApplicationContext()).edit();

        e.putString(GCMPreferences.SESSION, session);
        e.apply();

        if (!GCMMessageHelpers.isSavedToServer(getReactApplicationContext())) {
            GCMMessageHelpers.sendUpstreamMessageWithSession(getReactApplicationContext(), session);
        }
    }


    @ReactMethod
    public void setPreference(final String key, @Nullable final String value) {
        SharedPreferences.Editor e = GCMPreferences.get(getReactApplicationContext()).edit();

        e.putString(key, value);
        e.apply();
    }

    @ReactMethod
    public void getPreference(final String key, final Promise promise) {
        promise.resolve(GCMPreferences.get(getReactApplicationContext()).getString(key, ""));
    }
}
