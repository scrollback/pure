package chat.belong.hello.modules.gcm;

import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.support.v4.app.NotificationCompat;
import android.support.v4.content.ContextCompat;
import android.text.Spannable;
import android.text.SpannableString;
import android.text.style.StyleSpan;
import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.List;

import chat.belong.hello.MainActivity;
import chat.belong.hello.R;

public class NotificationHandler {

    private static final int NOTIFICATION_ID = 0;
    private static final String TAG = NotificationHandler.class.getSimpleName();
    private static final String NOTIFICATION_CLICKED_ACTION = "NOTIFICATION_CLICKED";
    private static final String NOTIFICATION_DELETED_ACTION = "NOTIFICATION_DELETED";

    private static boolean isNotificationDisabled(Context context) {
        return GCMPreferences.get(context).getString("enabled", "").equals("false");
    }

    private static void showNotifications(Context context, final List<JSONObject> notifications) throws JSONException, NoSuchFieldException {

        final JSONObject lastItem = notifications.get(notifications.size() - 1);
        final Note note = new Note(context, lastItem);

        final NotificationManager mNotificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);

        final BroadcastReceiver receiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                switch (intent.getAction()) {
                    case NOTIFICATION_CLICKED_ACTION:
                        Intent i = new Intent(context, MainActivity.class);
                        i.setAction(Intent.ACTION_VIEW);
                        if (note.link != null) {
                            i.setData(Uri.parse(note.link));
                        }
                        context.startActivity(i);
                    default:
                        mNotificationManager.cancelAll();
                        NotificationStorage.clearAllNotifications(context);
                }

                context.unregisterReceiver(this);
            }
        };

        context.registerReceiver(receiver, new IntentFilter(NOTIFICATION_CLICKED_ACTION));
        context.registerReceiver(receiver, new IntentFilter(NOTIFICATION_DELETED_ACTION));

        NotificationCompat.Style style;

        if (notifications.size() == 1) {
            style = new NotificationCompat.BigTextStyle();
        } else {
            NotificationCompat.InboxStyle inboxStyle = new NotificationCompat.InboxStyle();

            inboxStyle.setBigContentTitle(notifications.size() + " new notifications in " + context.getString(R.string.app_name));

            for (int i = notifications.size() - 1; i >= 0; i--) {
                Note n = new Note(context, notifications.get(i));
                Spannable sb = new SpannableString(n.title + " " + n.summary);
                sb.setSpan(new StyleSpan(android.graphics.Typeface.BOLD), 0, n.title.length(),
                        Spannable.SPAN_EXCLUSIVE_EXCLUSIVE);
                inboxStyle.addLine(sb);
            }

            style = inboxStyle;
        }

        NotificationCompat.Builder mBuilder =
                new NotificationCompat.Builder(context)
                        .setStyle(style)
                        .setSmallIcon(R.mipmap.ic_status)
                        .setColor(ContextCompat.getColor(context, R.color.primary))
                        .setContentTitle(note.title)
                        .setContentText(note.summary)
                        .setPriority(NotificationCompat.PRIORITY_HIGH)
                        .setCategory(NotificationCompat.CATEGORY_MESSAGE);

        Bitmap picture = note.getPicture();

        if (picture != null) {
            mBuilder.setLargeIcon(picture);
        }

        mBuilder.setContentIntent(PendingIntent.getBroadcast(context, 0, new Intent(NOTIFICATION_CLICKED_ACTION), 0));
        mBuilder.setDeleteIntent(PendingIntent.getBroadcast(context, 0, new Intent(NOTIFICATION_DELETED_ACTION), 0));

        mNotificationManager.notify(NOTIFICATION_ID, mBuilder.build());
    }

    public static void handleNotification(Context context, Bundle bundle) {
        String item = bundle.getString("data");

        if (item == null || item.isEmpty()) {
            return;
        }

        if (isNotificationDisabled(context)) {
            return;
        }

        try {
            JSONObject data = new JSONObject(item);
            NotificationStorage.addNotification(context, data);
        } catch (JSONException e) {
            Log.e(TAG, "Failed to parse notification", e);
        }

        List<JSONObject> notifications = NotificationStorage.getCurrentNotifications(context);

        if (notifications.size() == 0) {
            Log.d(TAG, "No active notifications");
            return;
        }

        try {
            showNotifications(context, notifications);
        } catch (JSONException | NoSuchFieldException e) {
            Log.e(TAG, "Failed to show notification", e);
        }
    }
}

