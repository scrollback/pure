package chat.belong.hello;

import android.app.Application;

import com.crashlytics.android.Crashlytics;

import io.fabric.sdk.android.Fabric;

public class Belong extends Application {
    @Override
    public void onCreate() {
        super.onCreate();

        Fabric.with(this, new Crashlytics());

        AppState.init(this);
    }
}
