package chat.belong.hello.modules.gcm;

import android.os.Bundle;
import android.util.Log;

import com.google.android.gms.gcm.GcmListenerService;

import chat.belong.hello.AppState;


public class GCMListenerService extends GcmListenerService {

    private static final String TAG = "GCMListenerService";
    private static final int NOTIFICATION_ID = 0;

    @Override
    public void onMessageReceived(String from, Bundle data) {

        Log.d(TAG, "Got notification: " + data);

        if (AppState.isForeground()) {
            Log.d(TAG, "App is in forground. Not showing notification.");
        } else {
            GCMNotificationHandler.send(this, NOTIFICATION_ID, data);
        }
    }
}
