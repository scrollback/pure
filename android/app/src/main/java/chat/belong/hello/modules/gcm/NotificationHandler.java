package chat.belong.hello.modules.gcm;

import android.app.Notification;
import android.app.NotificationManager;
import android.content.Context;
import android.os.Bundle;
import android.support.v4.app.NotificationCompat;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;

import chat.belong.hello.AppState;


public class NotificationHandler {

    private static final int NOTIFICATION_ID = 0;
    private static final String TAG = NotificationHandler.class.getSimpleName();

    private static void showNotifications(Context context, final JSONArray notifications) throws JSONException, IOException, NoSuchFieldException {

        final NotificationManager mNotificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        final JSONObject appearance = GCMPreferences.getAppearance(context);
        final NotificationCompat.Builder builder = NotificationItem.buildNotification(context, notifications, appearance);
        final Notification notification = builder.build();

        mNotificationManager.notify(NOTIFICATION_ID, notification);
    }

    public static void handleNotification(Context context, Bundle bundle) {

        JSONObject schema = GCMPreferences.getSchema(context);

        if (schema == null) {
            Log.e(TAG, "No schema specified");
            return;
        }

        try {
            JSONObject data = JSONUtils.bundleToJson(bundle, schema);
            GCMPreferences.addNotification(context, data);
        } catch (Exception e) {
            Log.e(TAG, "Failed to parse notification", e);
        }

        if (AppState.isForeground()) {
            Log.d(TAG, "App is in forground. Not showing notification.");
            return;
        }

        if (!GCMPreferences.isNotificationsEnabled(context)) {
            Log.d(TAG, "Notifications are disabled");
            return;
        }

        try {
            JSONArray notifications = GCMPreferences.getCurrentNotifications(context);
            JSONArray unreadNotifications = new JSONArray();

            for (int i = 0; i < notifications.length(); i++) {
                JSONObject notification = notifications.getJSONObject(i);

                if (notification.has("readTime")) {
                    continue;
                }

                unreadNotifications.put(notification);
            }

            if (unreadNotifications.length() == 0) {
                Log.d(TAG, "No active notifications");
                return;
            }

            showNotifications(context, unreadNotifications);
        } catch (Exception e) {
            Log.e(TAG, "Failed to show notification", e);
        }
    }
}
