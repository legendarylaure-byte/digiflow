// Rate limiter using Firestore for distributed rate limiting
import { db } from '../utils/firebase';
import * as functions from 'firebase-functions';

interface RateLimitConfig {
  window: number; // milliseconds
  max: number;
}

interface RateLimitRecord {
  count: number;
  windowStart: number;
}

export async function checkRateLimit(
  userId: string,
  action: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const key = `rate_limit_${action}_${userId}`;
  const now = Date.now();
  const windowStart = now - config.window;

  try {
    const doc = await db.collection('_rate_limits').doc(key).get();
    const data = doc.data() as RateLimitRecord | undefined;

    if (!data || data.windowStart < windowStart) {
      // New window
      await db.collection('_rate_limits').doc(key).set({
        count: 1,
        windowStart: now,
      });
      return { allowed: true, remaining: config.max - 1, resetIn: config.window };
    }

    if (data.count >= config.max) {
      const resetIn = data.windowStart + config.window - now;
      return { allowed: false, remaining: 0, resetIn };
    }

    await db.collection('_rate_limits').doc(key).update({
      count: data.count + 1,
    });

    return { allowed: true, remaining: config.max - data.count - 1, resetIn: data.windowStart + config.window - now };
  } catch (error) {
    // If rate limit check fails, allow the request (fail open)
    functions.logger.warn('Rate limit check failed', error);
    return { allowed: true, remaining: 1, resetIn: 0 };
  }
}

// Cleanup old rate limit records (call via scheduled function)
export async function cleanupRateLimits(): Promise<void> {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24 hours
  const snapshot = await db.collection('_rate_limits')
    .where('windowStart', '<', cutoff)
    .get();

  const batch = db.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
}
