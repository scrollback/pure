package chat.belong.hello.modules.gcm;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.support.v4.content.LocalBroadcastManager;

public class GCMRegistrationManager {

    final private Activity mActivity;
    final private BroadcastReceiver mRegistrationBroadcastReceiver;

    private boolean receiverRegistered;

    public GCMRegistrationManager(Activity activity) {
        mActivity = activity;

        mRegistrationBroadcastReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                SharedPreferences sharedPreferences = GCMPreferences.get(mActivity.getApplicationContext());
            }
        };
    }

    public void startIntentService() {
        // Start IntentService to register this application with GCM.
        Intent intent = new Intent(mActivity, GCMRegistrationIntentService.class);
        mActivity.startService(intent);
    }

    public void unRegisterReciever() {
        LocalBroadcastManager.getInstance(mActivity).unregisterReceiver(mRegistrationBroadcastReceiver);
        receiverRegistered = false;
    }

    public void registerReceiver() {
        if(!receiverRegistered) {
            LocalBroadcastManager.getInstance(mActivity).registerReceiver(mRegistrationBroadcastReceiver,
                    new IntentFilter(GCMPreferences.SAVED_TO_SERVER));
            receiverRegistered = true;
        }
    }
}
