package chat.belong.hello.modules.gcm;

import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.support.v4.app.NotificationCompat;
import android.support.v4.content.ContextCompat;
import android.util.Log;

import org.json.JSONException;

import chat.belong.hello.MainActivity;
import chat.belong.hello.R;

public class GCMNotificationHandler {

    private static final String TAG = "GCMNotificationHandler";

    public static void send(Context context, int id, Bundle bundle) {
        // If Push Notifications are disabled, do nothing
        if (GCMPreferences.get(context).getString("enabled", "").equals("false")) {
            Log.d(TAG, "Push notifications are disabled");

            return;
        }

        Note note = null;

        try {
            note = new Note(context, bundle);
        } catch (JSONException | NoSuchFieldException e) {
            Log.e(TAG, "Failed to show notification", e);
        }

        if (note == null) {
            return;
        }

        NotificationManager mNotificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);

        Intent i = new Intent(context, MainActivity.class);

        i.setAction(Intent.ACTION_VIEW);

        if (note.link != null) {
            i.setData(Uri.parse(note.link));
        }

        PendingIntent contentIntent = PendingIntent.getActivity(context, 0, i, PendingIntent.FLAG_CANCEL_CURRENT);

        NotificationCompat.Builder mBuilder =
                new NotificationCompat.Builder(context)
                        .setSmallIcon(R.mipmap.ic_status)
                        .setColor(ContextCompat.getColor(context, R.color.primary))
                        .setContentTitle(note.title)
                        .setContentText(note.summary)
                        .setStyle(new NotificationCompat.BigTextStyle())
                        .setPriority(NotificationCompat.PRIORITY_HIGH)
                        .setCategory(NotificationCompat.CATEGORY_MESSAGE)
                        .setGroupSummary(true)
                        .setAutoCancel(true);

        if (note.picture != null) {
            mBuilder.setLargeIcon(note.picture);
        }

        mBuilder.setContentIntent(contentIntent);

        mNotificationManager.notify(id, mBuilder.build());
    }
}
