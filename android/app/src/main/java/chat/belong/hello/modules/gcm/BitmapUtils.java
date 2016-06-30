package chat.belong.hello.modules.gcm;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.PorterDuff;
import android.graphics.PorterDuffXfermode;
import android.graphics.Rect;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;

public class BitmapUtils {

    private static Bitmap decodeStreamToBitmap(InputStream stream, int imageSize) throws IOException {
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

        } finally {
            is.close();
        }
    }

    private static Bitmap getScaledBitmap(String link, int imageSize) throws IOException {
        URL url = new URL(link);
        return decodeStreamToBitmap(url.openConnection().getInputStream(), imageSize);
    }

    public static Bitmap getBitmap(Context context, String link, int size) {
        final int IMAGE_SIZE = (int) (size * (context.getResources().getDisplayMetrics().density));

        try {
            Bitmap bitmap = getScaledBitmap(link, IMAGE_SIZE);
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
        } catch (IOException e) {
            return null;
        }
    }
}
