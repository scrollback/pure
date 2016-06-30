package chat.belong.hello.modules.gcm;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.support.v4.content.LocalBroadcastManager;

public class RegistrationManager {

    public static final String REGISTRATION_COMPLETE = "registration_complete";

    private final Activity mActivity;
    private final BroadcastReceiver mRegistrationBroadcastReceiver;

    private boolean receiverRegistered;

    public RegistrationManager(Activity activity) {
        mActivity = activity;

        mRegistrationBroadcastReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                // save registration receiver
            }
        };
    }

    public void startIntentService() {
        // Start IntentService to register this application with GCM.
        Intent intent = new Intent(mActivity, RegistrationIntentService.class);
        mActivity.startService(intent);
    }

    public void unRegisterReciever() {
        LocalBroadcastManager.getInstance(mActivity).unregisterReceiver(mRegistrationBroadcastReceiver);
        receiverRegistered = false;
    }

    public void registerReceiver() {
        if(!receiverRegistered) {
            LocalBroadcastManager.getInstance(mActivity).registerReceiver(mRegistrationBroadcastReceiver,
                    new IntentFilter(REGISTRATION_COMPLETE));
            receiverRegistered = true;
        }
    }
}
