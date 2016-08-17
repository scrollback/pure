package chat.belong.hello.modules.analytics;

import android.provider.Settings;
import android.util.NoSuchPropertyException;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;


public class InstallTrackerModule extends ReactContextBaseJavaModule {

    public InstallTrackerModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "InstallTrackerModule";
    }

    private InstallTracker getTracker() {
        return InstallTracker.getInstance(getReactApplicationContext());
    }

    @ReactMethod
    public void getAndroidID(Promise promise) {
        try {
            promise.resolve(Settings.Secure.ANDROID_ID);
        } catch (NoSuchPropertyException e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void getReferrer(Promise promise) {
        try {
            promise.resolve(getTracker().getReferrer());
        } catch (NoSuchPropertyException e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void getCampaignName(Promise promise) {
        try {
            promise.resolve(getTracker().getRefferalParameter(AnswersLogger.UTM_CAMPAIGN));
        } catch (NoSuchPropertyException e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void getCampaignSource(Promise promise) {
        try {
            promise.resolve(getTracker().getRefferalParameter(AnswersLogger.UTM_SOURCE));
        } catch (NoSuchPropertyException e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void getCampaignMedium(Promise promise) {
        try {
            promise.resolve(getTracker().getRefferalParameter(AnswersLogger.UTM_MEDIUM));
        } catch (NoSuchPropertyException e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void getCampaignTerm(Promise promise) {
        try {
            promise.resolve(getTracker().getRefferalParameter(AnswersLogger.UTM_TERM));
        } catch (NoSuchPropertyException e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void getCampaignContent(Promise promise) {
        try {
            promise.resolve(getTracker().getRefferalParameter(AnswersLogger.UTM_CONTENT));
        } catch (NoSuchPropertyException e) {
            promise.reject(e);
        }
    }
}
