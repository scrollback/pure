package chat.belong.hello.modules.gcm;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class NotificationStorage {

    private static final String STORAGE_KEY = "push_notifications_current_notifications";

    private static SharedPreferences getPreferences(Context context) {
        return context.getSharedPreferences(STORAGE_KEY, Context.MODE_PRIVATE);
    }

    private static SharedPreferences.Editor getEditor(Context context) {
        return getPreferences(context).edit();
    }

    public static void addNotification(Context context, JSONObject note) throws JSONException {
        note.put("timestamp", new Date().getTime());
        SharedPreferences.Editor editor = getEditor(context);
        editor.putString(UUID.randomUUID().toString(), note.toString());
        editor.apply();
    }

    public static List<JSONObject> getCurrentNotifications(Context context) {
        List<JSONObject> notifications = new ArrayList<>();
        Map<String, ?> allItems = getPreferences(context).getAll();

        for (String key : allItems.keySet()) {
            String data = (String) allItems.get(key);
            try {
                JSONObject notification = new JSONObject(data);
                notifications.add(notification);
            } catch (JSONException e) {
                // do nothing
            }
        }

        Collections.sort(notifications, new Comparator<JSONObject>() {
            @Override
            public int compare(JSONObject lhs, JSONObject rhs) {
                try {
                    Integer updateTimeLHS = lhs.getInt("timestamp");
                    Integer updateTimeRHS = rhs.getInt("timestamp");
                    return updateTimeLHS.compareTo(updateTimeRHS);
                } catch (JSONException e) {
                    return 0;
                }
            }
        });

        return notifications;
    }

    public static void clearAllNotifications(Context context) {
        SharedPreferences.Editor editor = getEditor(context);
        editor.clear();
        editor.apply();
    }
}
