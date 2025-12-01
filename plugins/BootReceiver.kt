package com.pharmexpress.vending

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent?) {
        if (intent?.action == Intent.ACTION_BOOT_COMPLETED) {
            Log.i("BootReceiver", "BOOT_COMPLETED received — launching app")

            val launchIntent = Intent(context, MainActivity::class.java).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
            }

            try {
                context.startActivity(launchIntent)
            } catch (e: Exception) {
                Log.e("BootReceiver", "Failed to launch activity: ${e.message}")
            }
        }
    }
}