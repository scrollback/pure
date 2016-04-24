package chat.belong.hello.modules.contacts;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class JSONHelpers {
    public static JSONArray ReadableArrayToJSON(ReadableArray array) throws JSONException {
        JSONArray json = new JSONArray();

        for (int i = 0; i < array.size(); i++) {
            switch (array.getType(i)) {
                case Null:
                    json.put(null);
                    break;
                case Boolean:
                    json.put(array.getBoolean(i));
                    break;
                case Number:
                    json.put(array.getDouble(i));
                    break;
                case String:
                    json.put(array.getString(i));
                    break;
                case Map:
                    json.put(ReadableMapToJSON(array.getMap(i)));
                    break;
                case Array:
                    json.put(ReadableArrayToJSON(array.getArray(i)));
                    break;
                default:
                    json.put(null);
            }
        }

        return json;
    }

    public static JSONObject ReadableMapToJSON(ReadableMap map) throws JSONException {
        ReadableMapKeySetIterator iterator = map.keySetIterator();
        JSONObject json = new JSONObject();

        while (iterator.hasNextKey()) {
            String key = iterator.nextKey();
            switch (map.getType(key)) {
                case Null:
                    json.put(key, null);
                    break;
                case Boolean:
                    json.put(key, map.getBoolean(key));
                    break;
                case Number:
                    json.put(key, map.getDouble(key));
                    break;
                case String:
                    json.put(key, map.getString(key));
                    break;
                case Map:
                    json.put(key, ReadableMapToJSON(map.getMap(key)));
                    break;
                case Array:
                    json.put(key, ReadableArrayToJSON(map.getArray(key)));
                    break;
            }
        }

        return json;
    }
}
