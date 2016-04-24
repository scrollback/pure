package chat.belong.hello.modules.gcm;

import android.app.IntentService;
import android.content.Intent;
import android.content.SharedPreferences;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;

import com.google.android.gms.gcm.GoogleCloudMessaging;
import com.google.android.gms.iid.InstanceID;

import chat.belong.hello.R;

public class GCMRegistrationIntentService extends IntentService {

    private static final String TAG = "GCMIntentService";

    public GCMRegistrationIntentService() {
        super(GCMRegistrationIntentService.class.getName());
    }

    @Override
    protected void onHandleIntent(Intent intent) {
        SharedPreferences sharedPreferences = GCMPreferences.get(this);

        try {
            InstanceID instanceID = InstanceID.getInstance(this);
            String token = instanceID.getToken(getString(R.string.gcm_defaultSenderId),
                    GoogleCloudMessaging.INSTANCE_ID_SCOPE, null);

            Log.d(TAG, "Refreshing registration token: " + token);

            GCMMessageHelpers.sendUpstreamMessageWithToken(getApplicationContext(), token);
            sharedPreferences.edit().putString(GCMPreferences.TOKEN, token).apply();
        } catch (Exception e) {
            Log.e(TAG, "Failed to complete token refresh", e);
        }

        Intent registrationComplete = new Intent(GCMPreferences.SAVED_TO_SERVER);
        LocalBroadcastManager.getInstance(this).sendBroadcast(registrationComplete);
    }
}
