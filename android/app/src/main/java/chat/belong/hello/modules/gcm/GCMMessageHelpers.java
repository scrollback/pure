package chat.belong.hello.modules.gcm;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.provider.Settings;
import android.util.Log;

import com.google.android.gms.gcm.GoogleCloudMessaging;

import java.util.UUID;

import chat.belong.hello.R;

public class GCMMessageHelpers {

    private static final String TAG = "GCMMessageHelpers";

    public static void setSavedToServer(Context context, boolean result) {
        SharedPreferences.Editor e = GCMPreferences.get(context).edit();
        e.putString(GCMPreferences.SAVED_TO_SERVER, result ?  "true" : "false");
        e.apply();
    }

    public static boolean isSavedToServer(Context context) {
        return GCMPreferences.get(context).getString(GCMPreferences.SAVED_TO_SERVER, "").equals("true");
    }

    public static void sendUpstreamMessage(final Context context, final String session, final String token) {
        final GoogleCloudMessaging gcm = GoogleCloudMessaging.getInstance(context);
        final String senderId = context.getString(R.string.gcm_defaultSenderId);
        final Bundle data = new Bundle();

        setSavedToServer(context, false);

        if (session.isEmpty() || token.isEmpty()) {
            return;
        }

        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    String uuid = Settings.Secure.getString(context.getContentResolver(),
                            Settings.Secure.ANDROID_ID);

                    data.putString("uuid", uuid);
                    data.putString("sessionId", session);
                    data.putString("token", token);

                    Log.d(TAG, "Sending upstream message to GCM: " + data);

                    gcm.send(senderId + "@gcm.googleapis.com", UUID.randomUUID().toString(), data);
                } catch (Exception e) {
                    Log.e(TAG, "Failed to send registration message to GCM for token: " + token);
                }
            }
        }).start();
    }

    public static void sendUpstreamMessageWithToken(Context context, final String token) {
        final SharedPreferences preferences = GCMPreferences.get(context);
        final String session = preferences.getString(GCMPreferences.SESSION, "");
        sendUpstreamMessage(context, session, token);
    }

    public static void sendUpstreamMessageWithSession(Context context, final String session) {
        final SharedPreferences preferences = GCMPreferences.get(context);
        final String token = preferences.getString(GCMPreferences.TOKEN, "");
        sendUpstreamMessage(context, session, token);
    }
}
