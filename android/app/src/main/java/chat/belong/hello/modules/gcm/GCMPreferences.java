package chat.belong.hello.modules.gcm;

import android.content.Context;
import android.content.SharedPreferences;

public class GCMPreferences {

    private static final String STORAGE_KEY = "push_notifications_shared_preferences";

    public static final String TOKEN = "token";
    public static final String SESSION = "session";
    public static final String SAVED_TO_SERVER = "saved_to_server";

    public static SharedPreferences get(Context context) {
        return context.getSharedPreferences(STORAGE_KEY, Context.MODE_PRIVATE);
    }
}
