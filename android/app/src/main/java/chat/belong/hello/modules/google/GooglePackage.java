package chat.belong.hello.modules.google;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.JavaScriptModule;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;


public class GooglePackage implements ReactPackage {

    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        GoogleApiManagerModule apiManager = new GoogleApiManagerModule(reactContext);

        return Arrays.<NativeModule>asList(
                new GoogleSignInModule(reactContext, apiManager),
                new GooglePlacesModule(reactContext, apiManager),
                new LocationListenerModule(reactContext, apiManager)
        );
    }

    @Override
    public List<Class<? extends JavaScriptModule>> createJSModules() {
        return Collections.emptyList();
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }
}
