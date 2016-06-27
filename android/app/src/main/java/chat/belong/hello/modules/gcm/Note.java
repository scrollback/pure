package chat.belong.hello.modules.gcm;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.PorterDuff;
import android.graphics.PorterDuffXfermode;
import android.graphics.Rect;
import android.support.annotation.Nullable;
import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;

public class Note {

    private static final String TAG = "Note";

    private static final String PROP_TITLE = "title";
    private static final String PROP_BODY = "body";
    private static final String PROP_LINK = "link";
    private static final String PROP_PICTURE = "picture";

    private final Context mContext;

    public final String title;
    public final String summary;
    public final String link;
    @Nullable
    public final String picture;

    public Note(Context context, JSONObject data) throws JSONException, NoSuchFieldException {
        mContext = context;

        title = data.getString(PROP_TITLE);
        summary = data.getString(PROP_BODY);
        link = data.getString(PROP_LINK);

        if (data.has(PROP_PICTURE)) {
            picture = data.getString(PROP_PICTURE);
        } else {
            picture = null;
        }
    }

    private Bitmap decodeStreamToBitmap(InputStream stream, int imageSize) {
        final BufferedInputStream is = new BufferedInputStream(stream, 32 * 1024);

        try {
            final BitmapFactory.Options decodeBitmapOptions = new BitmapFactory.Options();

            // For further memory savings, you may want to consider using this option
            // decodeBitmapOptions.inPreferredConfig = Config.RGB_565; // Uses 2-bytes instead of default 4 per pixel
            if (imageSize > 0) {
                final BitmapFactory.Options decodeBoundsOptions = new BitmapFactory.Options();

                decodeBoundsOptions.inJustDecodeBounds = true;

                is.mark(32 * 1024);

                BitmapFactory.decodeStream(is, null, decodeBoundsOptions);

                is.reset();

                final int originalWidth = decodeBoundsOptions.outWidth;
                final int originalHeight = decodeBoundsOptions.outHeight;

                // inSampleSize prefers multiples of 2, but we prefer to prioritize memory savings
                decodeBitmapOptions.inSampleSize = Math.max(1, Math.min(originalWidth / imageSize, originalHeight / imageSize));
            }

            return BitmapFactory.decodeStream(is, null, decodeBitmapOptions);

        } catch (IOException e) {
            Log.e(TAG, "Failed to decode stream to bitmap", e);
        } finally {
            try {
                is.close();
            } catch (IOException e) {
                // Ignore
            }
        }

        return null;
    }

    private Bitmap getScaledBitmap(String link, int imageSize) {
        URL url = null;

        try {
            url = new URL(link);
        } catch (MalformedURLException e) {
            Log.e(TAG, "Malformed URL: " + picture, e);
        }

        if (url != null) {
            try {
                return decodeStreamToBitmap(url.openConnection().getInputStream(), imageSize);
            } catch (IOException e) {
                Log.e(TAG, "Couldn't fetch image: " + picture, e);
            }
        }

        return null;
    }

    private Bitmap getBitmap(String link) {
        final int IMAGE_SIZE = (int) (48 * (mContext.getResources().getDisplayMetrics().density));

        Bitmap bitmap = getScaledBitmap(link, IMAGE_SIZE);

        if (bitmap != null) {
            Bitmap output = Bitmap.createBitmap(bitmap.getWidth(), bitmap.getHeight(), Bitmap.Config.ARGB_8888);

            if (output == null) {
                return null;
            }

            Canvas canvas = new Canvas(output);

            final Paint paint = new Paint();
            final Rect rect = new Rect(0, 0, bitmap.getWidth(),
                    bitmap.getHeight());

            paint.setAntiAlias(true);

            canvas.drawARGB(0, 0, 0, 0);
            canvas.drawCircle(bitmap.getWidth() / 2, bitmap.getHeight() / 2,
                    bitmap.getWidth() / 2, paint);

            paint.setXfermode(new PorterDuffXfermode(PorterDuff.Mode.SRC_IN));

            canvas.drawBitmap(bitmap, rect, rect, paint);

            return output;
        }

        return null;
    }

    public Bitmap getPicture() {
        if (picture != null) {
            return getBitmap(picture);
        }

        return null;
    }
}
