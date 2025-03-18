<template>
  <!-- This is just a meta component, no visible content -->
</template>

<script setup>
useHead({
  meta: [
    // Basic viewport settings
    {
      name: "viewport",
      content:
        "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
    },

    // iOS PWA specific
    { name: "apple-mobile-web-app-capable", content: "yes" },
    {
      name: "apple-mobile-web-app-status-bar-style",
      content: "#065f46",
    },
    { name: "apple-mobile-web-app-title", content: "Dart Killer" },

    // Android PWA specific
    { name: "mobile-web-app-capable", content: "yes" },
    { name: "theme-color", content: "#065f46" },
    { name: "msapplication-TileColor", content: "#065f46" },
    { name: "msapplication-navbutton-color", content: "#065f46" },
  ],
  link: [
    { rel: "icon", type: "image/png", href: "/pwa-icons/192.png" },
    { rel: "apple-touch-icon", href: "/pwa-icons/192.png" },
    { rel: "apple-touch-startup-image", href: "/pwa-icons/512.png" },
  ],
});
</script>
