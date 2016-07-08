package chat.belong.hello.modules.gcm;

import android.content.Context;
import android.content.SharedPreferences;
import android.support.annotation.Nullable;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class GCMPreferences {

    private static final String STORAGE_KEY = "gcm_shared_preferences";

    private static final String SCHEMA_KEY = "schema";
    private static final String FIELDS_KEY = "fields";
    private static final String APPEARANCE_KEY = "appearance";
    private static final String REGISTRATION_TOKEN_KEY = "token";
    private static final String SESSION_ID_KEY = "session";
    private static final String NOTIFICATIONS_KEY = "notifications";
    private static final String NOTIFICATION_ENABLED_KEY = "notification_enabled";
    private static final String SAVED_TO_SERVER_KEY = "saved_to_server";

    private static SharedPreferences getPreferences(Context context) {
        return context.getSharedPreferences(STORAGE_KEY, Context.MODE_PRIVATE);
    }

    private static SharedPreferences.Editor getEditor(Context context) {
        return getPreferences(context).edit();
    }

    public static boolean isSavedToServer(Context context) {
        return getPreferences(context).getBoolean(SAVED_TO_SERVER_KEY, false);
    }

    public static void setSavedToServer(Context context, boolean value) {
        SharedPreferences.Editor editor = getEditor(context);
        editor.putBoolean(SAVED_TO_SERVER_KEY, value);
        editor.apply();
    }

    public static void configureSchema(Context context, JSONObject schema) {
        SharedPreferences.Editor editor = getEditor(context);
        editor.putString(SCHEMA_KEY, schema.toString());
        editor.apply();
    }

    @Nullable
    public static JSONObject getSchema(Context context) {
        String schema = getPreferences(context).getString(SCHEMA_KEY, null);

        if (schema != null) {
            try {
                return new JSONObject(schema);
            } catch (JSONException e) {
                return null;
            }
        }

        return null;
    }

    public static void configureFields(Context context, JSONObject fields) {
        SharedPreferences.Editor editor = getEditor(context);
        editor.putString(FIELDS_KEY, fields.toString());
        editor.apply();
    }

    @Nullable
    public static JSONObject getFields(Context context) {
        String fields = getPreferences(context).getString(FIELDS_KEY, null);

        if (fields != null) {
            try {
                return new JSONObject(fields);
            } catch (JSONException e) {
                return null;
            }
        }

        return null;
    }

    public static void configureNotification(Context context, JSONObject appearance) {
        SharedPreferences.Editor editor = getEditor(context);
        editor.putString(APPEARANCE_KEY, appearance.toString());
        editor.apply();
    }

    @Nullable
    public static JSONObject getAppearance(Context context) {
        String appearance = getPreferences(context).getString(APPEARANCE_KEY, null);

        if (appearance != null) {
            try {
                return new JSONObject(appearance);
            } catch (JSONException e) {
                return null;
            }
        }

        return null;
    }

    public static void setSessionID(Context context, String sessionID) {
        SharedPreferences.Editor editor = getEditor(context);
        editor.putString(SESSION_ID_KEY, sessionID);
        editor.apply();

        if (isSavedToServer(context)) {
            MessageHelpers.sendUpstreamMessageWithSession(context, sessionID);
        }
    }

    @Nullable
    public static String getSessionID(Context context) {
        return getPreferences(context).getString(SESSION_ID_KEY, null);
    }

    public static void enableNotifications(Context context) {
        SharedPreferences.Editor editor = getEditor(context);
        editor.putBoolean(NOTIFICATION_ENABLED_KEY, true);
        editor.apply();
    }

    public static void disableNotifications(Context context) {
        SharedPreferences.Editor editor = getEditor(context);
        editor.putBoolean(NOTIFICATION_ENABLED_KEY, false);
        editor.apply();
    }

    public static boolean isNotificationsEnabled(Context context) {
        return getPreferences(context).getBoolean(NOTIFICATION_ENABLED_KEY, true);
    }

    public static void addNotification(Context context, JSONObject note) throws JSONException {
        String items = getPreferences(context).getString(NOTIFICATIONS_KEY, null);

        JSONArray notifications = items == null ? new JSONArray() : new JSONArray(items);
        notifications.put(note);
        SharedPreferences.Editor editor = getEditor(context);
        editor.putString(NOTIFICATIONS_KEY, notifications.toString());
        editor.apply();
    }

    public static JSONArray getCurrentNotifications(Context context) throws JSONException {
        String items = getPreferences(context).getString(NOTIFICATIONS_KEY, null);

        if (items == null) {
            return new JSONArray();
        }

        return new JSONArray(items);
    }

    public static void clearCurrentNotifications(Context context) {
        SharedPreferences.Editor editor = getEditor(context);
        editor.clear();
        editor.apply();
    }

    public static void setRegistrationToken(Context context, String token) {
        SharedPreferences.Editor editor = getEditor(context);
        editor.putString(REGISTRATION_TOKEN_KEY, token);
        editor.apply();
    }

    @Nullable
    public static String getRegistrationToken(Context context) {
        return getPreferences(context).getString(REGISTRATION_TOKEN_KEY, null);
    }
}
