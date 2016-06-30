package chat.belong.hello.modules.gcm;

import android.app.IntentService;
import android.content.Intent;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;

import com.google.android.gms.gcm.GoogleCloudMessaging;
import com.google.android.gms.iid.InstanceID;

import chat.belong.hello.R;

public class RegistrationIntentService extends IntentService {

    private static final String TAG = "GCMIntentService";

    public RegistrationIntentService() {
        super(RegistrationIntentService.class.getName());
    }

    @Override
    protected void onHandleIntent(Intent intent) {
        try {
            InstanceID instanceID = InstanceID.getInstance(this);
            String token = instanceID.getToken(getString(R.string.gcm_defaultSenderId),
                    GoogleCloudMessaging.INSTANCE_ID_SCOPE, null);

            Log.d(TAG, "Refreshing registration token: " + token);

            MessageHelpers.sendUpstreamMessageWithToken(getApplicationContext(), token);
            GCMPreferences.setRegistrationToken(getApplicationContext(), token);
        } catch (Exception e) {
            Log.e(TAG, "Failed to complete token refresh", e);
        }

        Intent registrationComplete = new Intent(RegistrationManager.REGISTRATION_COMPLETE);
        LocalBroadcastManager.getInstance(this).sendBroadcast(registrationComplete);
    }
}
