package chat.belong.hello.modules.gcm;

import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.net.Uri;
import android.support.v4.app.NotificationCompat;
import android.text.Html;

import com.samskivert.mustache.Mustache;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;

import chat.belong.hello.MainActivity;
import chat.belong.hello.R;

public class NotificationItem {

    private static boolean arrayContains(JSONArray array, String value) throws JSONException {
        for (int i = 0; i < array.length(); i++) {
            if (value.equals(array.getString(i))) {
                return true;
            }
        }

        return false;
    }

    // TODO: Move this to JS
    private static JSONArray getUniqueRoomNames(JSONArray notifications) {
        JSONArray rooms = new JSONArray();

        for (int i = 0; i < notifications.length(); i++) {
            try {
                String room = notifications
                        .getJSONObject(i)
                        .getJSONObject("data")
                        .getJSONObject("room")
                        .getString("name");

                if (!arrayContains(rooms, room)) {
                    rooms.put(room);
                }
            } catch (Exception e) {
                // do nothing
            }
        }

        return rooms;
    }

    public static NotificationCompat.Builder buildNotification(Context context, JSONArray notifications, JSONObject appearance) throws JSONException {

        int priority;

        switch (appearance.getString("priority")) {
            case "min":
                priority = NotificationCompat.PRIORITY_MIN;
                break;
            case "low":
                priority = NotificationCompat.PRIORITY_LOW;
                break;
            case "high":
                priority = NotificationCompat.PRIORITY_HIGH;
                break;
            case "max":
                priority = NotificationCompat.PRIORITY_MAX;
                break;
            default:
                priority = NotificationCompat.PRIORITY_DEFAULT;
        }

        String category = null;

        switch (appearance.getString("category")) {
            case "alarm":
                category = NotificationCompat.CATEGORY_ALARM;
                break;
            case "call":
                category = NotificationCompat.CATEGORY_CALL;
                break;
            case "email":
                category = NotificationCompat.CATEGORY_EMAIL;
                break;
            case "error":
                category = NotificationCompat.CATEGORY_ERROR;
                break;
            case "event":
                category = NotificationCompat.CATEGORY_EVENT;
                break;
            case "message":
                category = NotificationCompat.CATEGORY_MESSAGE;
                break;
            case "progress":
                category = NotificationCompat.CATEGORY_PROGRESS;
                break;
            case "promo":
                category = NotificationCompat.CATEGORY_PROMO;
                break;
            case "recommendation":
                category = NotificationCompat.CATEGORY_RECOMMENDATION;
                break;
            case "service":
                category = NotificationCompat.CATEGORY_SERVICE;
                break;
            case "social":
                category = NotificationCompat.CATEGORY_SOCIAL;
                break;
            case "status":
                category = NotificationCompat.CATEGORY_STATUS;
                break;
            case "system":
                category = NotificationCompat.CATEGORY_SYSTEM;
                break;
            case "transport":
                category = NotificationCompat.CATEGORY_TRANSPORT;
                break;
        }

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context);

        builder
                .setPriority(priority)
                .setCategory(category);

        if (appearance.has("sticky")) {
            builder.setOngoing(appearance.getBoolean("sticky"));
        }

        if (appearance.has("slient")) {
            if (!appearance.getBoolean("slient")) {
                builder.setDefaults(NotificationCompat.DEFAULT_SOUND);
            }
        }

        if (appearance.has("color")) {
            String color = appearance.getString("color");
            builder.setColor(Color.parseColor(color));
        }

        if (appearance.has("vibrate")) {
            JSONArray vibrate = appearance.getJSONArray("vibrate");
            long[] pattern = new long[vibrate.length()];

            for (int i = 0; i < vibrate.length(); i++) {
                pattern[i] = vibrate.getInt(i);
            }

            builder.setVibrate(pattern);
        }

        JSONObject template = appearance.getJSONObject("template");

        ArrayList items = JSONUtils.jsonToArrayList(notifications);
        ArrayList rooms = JSONUtils.jsonToArrayList(getUniqueRoomNames(notifications));

        Collections.reverse(items);
        Collections.reverse(rooms);

        if (appearance.has("count") && appearance.getBoolean("count")) {
            builder.setNumber(items.size());
        }

        if (appearance.has("style")) {
            NotificationCompat.Style style = null;

            switch (appearance.getString("style")) {
                case "bigtext":
                    style = new NotificationCompat.BigTextStyle();
                    break;
                case "bigpicture":
                    style = new NotificationCompat.BigPictureStyle();
                    break;
                case "inbox":
                    NotificationCompat.InboxStyle inboxStyle = new NotificationCompat.InboxStyle();
                    JSONObject options = template.getJSONObject("style");

                    if (options.has("title")) {
                        String title = buildTemplateForNotifications(options.getString("title"), items, rooms);
                        if (!title.isEmpty()) {
                            inboxStyle.setBigContentTitle(Html.fromHtml(title));
                            builder.setContentTitle(Html.fromHtml(title));
                        }
                    }

                    if (options.has("summary")) {
                        String summary = buildTemplateForNotifications(options.getString("summary"), items, rooms);
                        if (!summary.isEmpty()) {
                            inboxStyle.setSummaryText(Html.fromHtml(summary));
                        }
                    }

                    if (options.has("line")) {
                        for (int i = notifications.length() - 1; i >= 0; i--) {
                            String line = buildTemplateForNotification(
                                    options.getString("line"), i,
                                    JSONUtils.jsonToHashMap(notifications.getJSONObject(i)));
                            if (!line.isEmpty()) {
                                inboxStyle.addLine(Html.fromHtml(line));

                                if (i == notifications.length() - 1) {
                                    builder.setContentText(Html.fromHtml(line));
                                }
                            }
                        }
                    }

                    style = inboxStyle;
                    break;
            }

            if (style != null) {
                builder.setStyle(style);
            }
        }

        String title = buildTemplateForNotifications(template.getString("title"), items, rooms);
        String body = buildTemplateForNotifications(template.getString("body"), items, rooms);

        if (!title.isEmpty()) {
            builder.setContentTitle(Html.fromHtml(title));
        }

        if (!body.isEmpty()) {
            builder.setContentText(Html.fromHtml(body));
        }

        if (template.has("picture")) {
            String picture = buildTemplateForNotifications(template.getString("picture"), items, rooms);
            if (!picture.isEmpty()) {
                Bitmap bitmap = BitmapUtils.getBitmap(context, picture, 48);

                if (bitmap != null) {
                    builder.setLargeIcon(bitmap);
                }
            }
        }

        Intent intent = new Intent(context, MainActivity.class);
        intent.setAction(Intent.ACTION_VIEW);

        if (template.has("link")) {
            String link = buildTemplateForNotifications(template.getString("link"), items, rooms);
            if (!link.isEmpty()) {
                intent.setData(Uri.parse(link));
            }
        }

        PendingIntent contentIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_CANCEL_CURRENT);

        builder.setContentIntent(contentIntent);
        builder.setSmallIcon(R.mipmap.ic_status);
        builder.setAutoCancel(true);

        return builder;
    }

    private static String buildTemplateForNotifications(final String raw, final ArrayList data, final ArrayList rooms) throws JSONException {
        return Mustache.compiler().escapeHTML(false).compile(raw).execute(new Object() {
            @SuppressWarnings("unused")
            public ArrayList items = data;
            @SuppressWarnings("unused")
            public int length = data.size();
            @SuppressWarnings("unused")
            public boolean single = length == 1;
            @SuppressWarnings("unused")
            public ArrayList roomNames = rooms;
        });
    }

    private static String buildTemplateForNotification(String raw, final int i, final HashMap data) throws JSONException {
        return Mustache.compiler().escapeHTML(false).compile(raw).execute(new Object() {
            @SuppressWarnings("unused")
            public HashMap item = data;
            @SuppressWarnings("unused")
            public int index = i;
        });
    }
}
