package chat.belong.hello.modules.gcm;

import android.os.Bundle;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;


public class JSONUtils {

    private static final String TYPE_STRING = "string";
    private static final String TYPE_NUMBER = "number";
    private static final String TYPE_BOOLEAN = "boolean";
    private static final String TYPE_ARRAY = "Array";
    private static final String TYPE_OBJECT = "Object";

    public static JSONObject bundleToJson(Bundle bundle, JSONObject schema) throws JSONException {
        JSONObject json = new JSONObject();
        Iterator<String> keys = schema.keys();

        while (keys.hasNext()) {
            String key = keys.next();
            Object type = schema.get(key);

            if (type instanceof String) {
                switch ((String) type) {
                    case TYPE_STRING:
                        json.put(key, bundle.getString(key));
                        break;
                    case TYPE_NUMBER:
                        json.put(key, bundle.getDouble(key));
                        break;
                    case TYPE_BOOLEAN:
                        json.put(key, bundle.getBoolean(key));
                        break;
                    case TYPE_ARRAY:
                        json.put(key, new JSONArray(bundle.getString(key)));
                        break;
                    case TYPE_OBJECT:
                        json.put(key, new JSONObject(bundle.getString(key)));
                        break;
                    default:
                        json.put(key, null);
                }
            } else if (type instanceof JSONObject){
                json.put(key, new JSONObject(bundle.getString(key)));
            } else {
                json.put(key, null);
            }
        }

        return json;
    }

    public static JSONArray redableArrayToJson(ReadableArray array) throws JSONException {
        JSONArray json = new JSONArray();

        for (int i = 0; i < array.size(); i++) {
            switch (array.getType(i)) {
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
                    json.put(readableMapToJson(array.getMap(i)));
                    break;
                case Array:
                    json.put(redableArrayToJson(array.getArray(i)));
                    break;
                default:
                    json.put(null);;
            }
        }

        return json;
    }

    public static JSONObject readableMapToJson(ReadableMap map) throws JSONException {
        JSONObject json = new JSONObject();
        ReadableMapKeySetIterator iterator = map.keySetIterator();

        while (iterator.hasNextKey()) {
            String key = iterator.nextKey();
            switch (map.getType(key)) {
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
                    json.put(key, readableMapToJson(map.getMap(key)));
                    break;
                case Array:
                    json.put(key, redableArrayToJson(map.getArray(key)));
                    break;
                default:
                    json.put(key, null);
            }
        }

        return json;
    }

    public static WritableArray jsonToWritableArray(JSONArray json) throws JSONException {
        WritableArray array = Arguments.createArray();

        for (int i = 0; i < json.length(); i++) {
            Object value = json.get(i);

            if (value instanceof JSONArray) {
                array.pushArray(jsonToWritableArray((JSONArray) value));
            } else if (value instanceof JSONObject) {
                array.pushMap(jsonToWritableMap((JSONObject) value));
            } else if (value instanceof String) {
                array.pushString((String) value);
            } else if (value instanceof Integer) {
                array.pushInt((Integer) value);
            } else if (value instanceof Double) {
                array.pushDouble((Double) value);
            } else if (value instanceof Boolean) {
                array.pushBoolean((Boolean) value);
            } else {
                array.pushNull();
            }
        }

        return array;
    }

    public static WritableMap jsonToWritableMap(JSONObject json) throws JSONException {
        WritableMap map = Arguments.createMap();
        Iterator<?> keys = json.keys();

        while(keys.hasNext() ) {
            String key = (String) keys.next();
            Object value = json.get(key);

            if (value instanceof JSONArray) {
                map.putArray(key, jsonToWritableArray((JSONArray) value));
            } else if (value instanceof JSONObject) {
                map.putMap(key, jsonToWritableMap((JSONObject) value));
            } else if (value instanceof String) {
                map.putString(key, (String) value);
            } else if (value instanceof Integer) {
                map.putInt(key, (Integer) value);
            } else if (value instanceof Double) {
                map.putDouble(key, (Double) value);
            } else if (value instanceof Boolean) {
                map.putBoolean(key, (Boolean) value);
            } else {
                map.putNull(key);
            }
        }

        return map;
    }

    public static HashMap<String, Object> jsonToHashMap(JSONObject object) throws JSONException {
        HashMap<String, Object> map = new HashMap<>();
        Iterator keys = object.keys();
        while (keys.hasNext()) {
            String key = (String) keys.next();
            map.put(key, objectFromJson(object.get(key)));
        }
        return map;
    }

    public static ArrayList<Object> jsonToArrayList(JSONArray array) throws JSONException {
        ArrayList<Object> list = new ArrayList<>();
        for (int i = 0; i < array.length(); i++) {
            list.add(objectFromJson(array.get(i)));
        }
        return list;
    }

    private static Object objectFromJson(Object json) throws JSONException {
        if (json instanceof JSONObject) {
            return jsonToHashMap((JSONObject) json);
        } else if (json instanceof JSONArray) {
            return jsonToArrayList((JSONArray) json);
        } else {
            return json;
        }
    }
}
