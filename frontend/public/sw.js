self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || "إشعار جديد", {
      body:  data.body  || "",
      icon:  "/icons/icon-192x192.png",
      badge: "/icons/badge-72x72.png",
      dir:   "rtl",
      lang:  "ar",
      data:  data.data  || {},
      actions: [
        { action: "open",  title: "فتح" },
        { action: "close", title: "إغلاق" },
      ],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "close") return;
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      const url = event.notification.data?.url || "/notifications";
      for (const client of list) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      clients.openWindow(url);
    })
  );
});