package chat.belong.hello.modules.network;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter;

import java.io.IOException;
import java.net.SocketTimeoutException;

/**
 * Util methods to send network responses to JS.
 */
public class ResponseUtil {
    public static void onDataSend(
            RCTDeviceEventEmitter eventEmitter,
            int requestId,
            long progress,
            long total) {
        WritableArray args = Arguments.createArray();
        args.pushInt(requestId);
        args.pushInt((int) progress);
        args.pushInt((int) total);
        eventEmitter.emit("didSendNetworkData", args);
    }

    public static void onDataReceived(
            RCTDeviceEventEmitter eventEmitter,
            int requestId,
            String data) {
        String strippedData = data.replace("\u2028", "").replace("\u2029", "");

        WritableArray args = Arguments.createArray();
        args.pushInt(requestId);
        args.pushString(strippedData);

        eventEmitter.emit("didReceiveNetworkData", args);
    }

    public static void onRequestError(
            RCTDeviceEventEmitter eventEmitter,
            int requestId,
            String error,
            IOException e) {
        WritableArray args = Arguments.createArray();
        args.pushInt(requestId);
        args.pushString(error);

        if ((e != null) && (e.getClass() == SocketTimeoutException.class)) {
            args.pushBoolean(true); // last argument is a time out boolean
        }

        eventEmitter.emit("didCompleteNetworkResponse", args);
    }

    public static void onRequestSuccess(RCTDeviceEventEmitter eventEmitter, int requestId) {
        WritableArray args = Arguments.createArray();
        args.pushInt(requestId);
        args.pushNull();

        eventEmitter.emit("didCompleteNetworkResponse", args);
    }

    public static void onResponseReceived(
            RCTDeviceEventEmitter eventEmitter,
            int requestId,
            int statusCode,
            WritableMap headers,
            String url) {
        WritableArray args = Arguments.createArray();
        args.pushInt(requestId);
        args.pushInt(statusCode);
        args.pushMap(headers);
        args.pushString(url);

        eventEmitter.emit("didReceiveNetworkResponse", args);
    }
}