package chat.belong.hello.modules.gcm;

import android.os.Bundle;
import android.util.Log;

import com.google.android.gms.gcm.GcmListenerService;


public class GCMListenerService extends GcmListenerService {

    private static final String TAG = "GCMListenerService";

    @Override
    public void onMessageReceived(String from, Bundle data) {

        Log.d(TAG, "Got notification: " + data);

        NotificationHandler.handleNotification(this, data);
    }
}
