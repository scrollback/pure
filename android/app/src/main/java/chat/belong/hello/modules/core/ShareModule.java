package chat.belong.hello.modules.core;

import android.app.Activity;
import android.content.Intent;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class ShareModule extends ReactContextBaseJavaModule {

    private static final String ERR_ACTIVITY_DOES_NOT_EXIST = "Activity doesn't exist";
    private static final String ERR_ACTIVITY_DOES_NOT_EXIST_CODE = "ERR_ACTIVITY_DOES_NOT_EXIST";

    public ShareModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "ShareModule";
    }

    @ReactMethod
    public void shareItem(final String title, final String content, final Promise promise) {
        Intent sharingIntent = new Intent(Intent.ACTION_SEND);

        sharingIntent.setType("text/plain");
        sharingIntent.putExtra(android.content.Intent.EXTRA_TEXT, content);

        Activity currentActivity = getCurrentActivity();

        if (currentActivity != null) {
            currentActivity.startActivity(Intent.createChooser(sharingIntent, title));
            promise.resolve(true);
        } else {
            promise.reject(ERR_ACTIVITY_DOES_NOT_EXIST_CODE, ERR_ACTIVITY_DOES_NOT_EXIST);
        }

    }
}
