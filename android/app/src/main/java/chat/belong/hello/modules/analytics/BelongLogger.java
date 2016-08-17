package chat.belong.hello.modules.analytics;

import android.content.Context;
import android.provider.Settings;
import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.Map;

import chat.belong.hello.R;
import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class BelongLogger {

    private static String TAG = "BELONG_LOGGER";

    public static void logEvent(Context context, String type, JSONObject data) throws JSONException {
        JSONObject event = new JSONObject();

        event.put("type", type);
        event.put("data", data);

        final String endpoint = context.getString(R.string.app_protocol)
                + "//"
                + context.getString(R.string.app_host)
                + "/x/analytics";

        MediaType JSON = MediaType.parse("application/json; charset=utf-8");
        OkHttpClient client = new OkHttpClient();
        RequestBody body = RequestBody.create(JSON, event.toString());

        Request request = new Request.Builder()
                .url(endpoint)
                .post(body)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException throwable) {
                Log.e(TAG, "Request failed: " + endpoint, throwable);
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (response.isSuccessful()) {
                    Log.d(TAG, "Success: " + response.body().string());
                } else {
                    Log.e(TAG, "Failure: " + response.message());
                }
            }
        });
    }

    public static void logInstall(Context context, String referrer, Map<String, String> params) {

        JSONObject data = new JSONObject();

        try {
            data.put("android_id", Settings.Secure.ANDROID_ID);
        } catch (JSONException e) {
            Log.e(TAG, "Failed to set 'android_id': " + Settings.Secure.ANDROID_ID, e);
        }

        if (referrer != null) {
            try {
                data.put("referrer", referrer);
            } catch (JSONException e) {
                Log.e(TAG, "Failed to set 'referrer': " + referrer, e);
            }
        }

        if (params != null && !params.isEmpty()) {
            for (Map.Entry<String, String> entry : params.entrySet()) {
                try {
                    data.put(entry.getKey(), entry.getValue());
                } catch (JSONException e) {
                    Log.e(TAG, "Failed to set '" + entry.getKey() + "': " + entry.getValue(), e);
                }
            }
        }

        try {
            logEvent(context, "install", data);
        } catch (JSONException e) {
            Log.e(TAG, "Failed to set data and type", e);
        }
    }
}
