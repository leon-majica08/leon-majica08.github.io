/* =========================================
   LEON & MAJICA — PRIVATE MEMORIES
   APP.JS — PART 1
   ========================================= */


/* =========================================
   SUPABASE CONFIGURATION
   ========================================= */

const SUPABASE_URL =
    "https://cbxchhonkkrlwisjjonk.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_U2CbY-32ZYfAtp7YRlokcQ_uK8bKsQ6";


/*
   The Supabase browser client is loaded dynamically.
   This means you do not need to add another script
   to index.html.
*/

let supabaseClient = null;


/* =========================================
   LOGIN DETAILS
   ========================================= */

const LOGIN_USERNAME = "leon&majica";
const LOGIN_PASSWORD = "12082000";


/* =========================================
   GLOBAL VARIABLES
   ========================================= */

let currentPlaylist = [];
let currentSongIndex = -1;

let currentUploadType = null;

let notificationTimer = null;


/* =========================================
   DOM HELPERS
   ========================================= */

function $(id) {
    return document.getElementById(id);
}


function showElement(element) {
    if (!element) return;

    element.classList.remove("hidden");
}


function hideElement(element) {
    if (!element) return;

    element.classList.add("hidden");
}


/* =========================================
   LOAD SUPABASE
   ========================================= */

function loadSupabase() {

    return new Promise((resolve, reject) => {

        if (
            window.supabase &&
            typeof window.supabase.createClient === "function"
        ) {
            resolve();
            return;
        }


        const script =
            document.createElement("script");

        script.src =
            "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

        script.onload = () => {
            resolve();
        };

        script.onerror = () => {
            reject(
                new Error(
                    "Unable to load Supabase."
                )
            );
        };

        document.head.appendChild(script);

    });

}


/* =========================================
   INITIALIZE SUPABASE
   ========================================= */

async function initializeSupabase() {

    try {

        await loadSupabase();

        supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY
            );

        return true;

    } catch (error) {

        console.error(
            "Supabase initialization error:",
            error
        );

        showNotification(
            "Unable to connect to Supabase.",
            "⚠️"
        );

        return false;
    }

}


/* =========================================
   LOGIN
   ========================================= */

function initializeLogin() {

    const loginForm =
        $("loginForm");

    if (!loginForm) {
        return;
    }


    loginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const username =
                $("username")?.value.trim();

            const password =
                $("password")?.value;


            const error =
                $("loginError");


            if (
                username === LOGIN_USERNAME &&
                password === LOGIN_PASSWORD
            ) {

                sessionStorage.setItem(
                    "leonMajicaLoggedIn",
                    "true"
                );

                if (error) {
                    error.textContent = "";
                }

                openApp();

            } else {

                if (error) {
                    error.textContent =
                        "Incorrect username or password.";
                }

            }

        }
    );

}


/* =========================================
   CHECK LOGIN
   ========================================= */

function checkLogin() {

    const loggedIn =
        sessionStorage.getItem(
            "leonMajicaLoggedIn"
        );


    if (loggedIn === "true") {

        openApp();

    } else {

        showLogin();

    }

}


/* =========================================
   SHOW LOGIN
   ========================================= */

function showLogin() {

    const loginScreen =
        $("loginScreen");

    const app =
        $("app");


    showElement(loginScreen);
    hideElement(app);

}


/* =========================================
   OPEN APP
   ========================================= */

async function openApp() {

    const loginScreen =
        $("loginScreen");

    const app =
        $("app");


    hideElement(loginScreen);
    showElement(app);


    /*
       Supabase is initialized when the app
       opens.
    */

    if (!supabaseClient) {
        await initializeSupabase();
    }
   if (supabaseClient) {
    await loadHeroGalleryPhotos();
    await loadSiteBackgroundGallery();
    await loadSavedSiteBackground();
    await loadMusicGalleryPhotos();
   }


    /*
       These functions will be created in
       the next app.js sections.
    */

    if (typeof loadAllMemories === "function") {

        await loadAllMemories();

    }

}


/* =========================================
   LOGOUT
   ========================================= */

function initializeLogout() {

    const logoutButton =
        $("logoutButton");


    if (!logoutButton) {
        return;
    }


    logoutButton.addEventListener(
        "click",
        function () {

            sessionStorage.removeItem(
                "leonMajicaLoggedIn"
            );


            const player =
                $("audioPlayer");


            if (player) {

                player.pause();

                player.removeAttribute("src");

                player.load();

            }


            currentPlaylist = [];

            currentSongIndex = -1;


            showLogin();


            showNotification(
                "You have been logged out.",
                "👋"
            );

        }
    );

}


/* =========================================
   NAVIGATION
   ========================================= */

function initializeNavigation() {

    const buttons =
        document.querySelectorAll(
            ".nav-button"
        );


    const sections =
        document.querySelectorAll(
            ".page-section"
        );


    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const targetId =
                        button.dataset.section;


                    buttons.forEach(
                        function (item) {
                            item.classList.remove(
                                "active"
                            );
                        }
                    );


                    sections.forEach(
                        function (section) {
                            section.classList.remove(
                                "active-section"
                            );
                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    const target =
                        $(targetId);


                    if (target) {

                        target.classList.add(
                            "active-section"
                        );

                    }

                }
            );

        }
    );

}


/* =========================================
   MODAL SYSTEM
   ========================================= */

function openModal(modalId) {

    const modal =
        $(modalId);

    if (!modal) {
        return;
    }

    showElement(modal);

    document.body.style.overflow =
        "hidden";

}


function closeModal(modalId) {

    const modal =
        $(modalId);

    if (!modal) {
        return;
    }

    hideElement(modal);

    /*
       Only restore scrolling if there
       isn't another open modal.
    */

    const openModalExists =
        document.querySelector(
            ".modal:not(.hidden)"
        );

    if (!openModalExists) {

        document.body.style.overflow =
            "";

    }

}


/* =========================================
   INITIALIZE MODALS
   ========================================= */

function initializeModals() {

    const closeButtons =
        document.querySelectorAll(
            "[data-close-modal]"
        );


    closeButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    closeModal(
                        button.dataset.closeModal
                    );

                }
            );

        }
    );


    /*
       Close modal when clicking outside
       the modal box.
    */

    document
        .querySelectorAll(".modal")
        .forEach(
            function (modal) {

                modal.addEventListener(
                    "click",
                    function (event) {

                        if (
                            event.target === modal
                        ) {

                            closeModal(
                                modal.id
                            );

                        }

                    }
                );

            }
        );


    /*
       ESC closes open modals.
    */

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key !== "Escape") {
                return;
            }


            document
                .querySelectorAll(
                    ".modal:not(.hidden)"
                )
                .forEach(
                    function (modal) {

                        closeModal(
                            modal.id
                        );

                    }
                );


            const viewer =
                $("imageViewer");


            if (
                viewer &&
                !viewer.classList.contains(
                    "hidden"
                )
            ) {

                closeImageViewer();

            }

        }
    );

}


/* =========================================
   NOTIFICATIONS
   ========================================= */

function showNotification(
    message,
    icon = "❤️"
) {

    const notification =
        $("notification");

    const notificationText =
        $("notificationText");

    const notificationIcon =
        $("notificationIcon");


    if (
        !notification ||
        !notificationText
    ) {
        return;
    }


    notificationText.textContent =
        message;


    if (notificationIcon) {

        notificationIcon.textContent =
            icon;

    }


    showElement(notification);


    if (notificationTimer) {

        clearTimeout(
            notificationTimer
        );

    }


    notificationTimer =
        setTimeout(
            function () {

                hideElement(
                    notification
                );

            },
            3000
        );

}

/* =========================================
   FULL-SCREEN PHOTO NAVIGATION
   ========================================= */

let viewerPhotoList = [];
let viewerPhotoIndex = 0;

function openImageViewerForPhoto(photoId) {
    const photoIndex = viewerPhotoList.findIndex(
        photo => String(photo.id) === String(photoId)
    );

    if (photoIndex === -1) {
        return;
    }

    setViewerPhoto(photoIndex);
}

function setViewerPhoto(index) {

    if (
        index < 0 ||
        index >= viewerPhotoList.length
    ) {
        return;
    }

    viewerPhotoIndex = index;

    const photo = viewerPhotoList[index];

    openImageViewer(
        photo.signed_url || "",
        photo.caption || photo.file_name || "Memory"
    );
}

function showPreviousViewerPhoto() {
    if (viewerPhotoIndex > 0) {
        setViewerPhoto(viewerPhotoIndex - 1);
    }
}

function showNextViewerPhoto() {
    if (viewerPhotoIndex < viewerPhotoList.length - 1) {
        setViewerPhoto(viewerPhotoIndex + 1);
    }
}
/* =========================================
   IMAGE VIEWER
   ========================================= */

function initializeImageViewer() {

    const closeButton =
        $("closeImageViewer");


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeImageViewer
        );

    }


    const viewer =
        $("imageViewer");


    if (viewer) {

        viewer.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === viewer
                ) {

                    closeImageViewer();

                }

            }
        );

    }

    const previousButton = $("previousViewerImage");
    const nextButton = $("nextViewerImage");

    if (previousButton) {
        previousButton.addEventListener("click", function (event) {
            event.stopPropagation();
            showPreviousViewerPhoto();
        });
    }

    if (nextButton) {
        nextButton.addEventListener("click", function (event) {
            event.stopPropagation();
            showNextViewerPhoto();
        });
    }

}


function openImageViewer(
    imageUrl,
    caption = ""
) {

    const viewer =
        $("imageViewer");

    const image =
        $("viewerImage");

    const captionElement =
        $("viewerCaption");


    if (!viewer || !image) {
        return;
    }


    image.src =
        imageUrl;


    image.alt =
        caption || "Memory";


    if (captionElement) {

        captionElement.textContent =
            caption;

    }


    showElement(viewer);

    document.body.style.overflow =
        "hidden";

}


function closeImageViewer() {

    const viewer =
        $("imageViewer");

    const image =
        $("viewerImage");


    hideElement(viewer);


    if (image) {
        image.src = "";
    }


    document.body.style.overflow =
        "";
   const previousButton = $("previousViewerImage");
const nextButton = $("nextViewerImage");

if (previousButton) {
    previousButton.addEventListener("click", function (event) {
        event.stopPropagation();
        showPreviousViewerPhoto();
    });
}

if (nextButton) {
    nextButton.addEventListener("click", function (event) {
        event.stopPropagation();
        showNextViewerPhoto();
    });
    }

}


/* =========================================
   UPLOAD BUTTON INITIALIZATION
   ========================================= */

function initializeUploadButtons() {

    const photoButton =
        $("uploadPhotoButton");

    const videoButton =
        $("uploadVideoButton");

    const musicButton =
        $("uploadMusicButton");


    if (photoButton) {

        photoButton.addEventListener(
            "click",
            function () {

                openUploadModal("photo");

            }
        );

    }


    if (videoButton) {

        videoButton.addEventListener(
            "click",
            function () {

                openUploadModal("video");

            }
        );

    }


    if (musicButton) {

        musicButton.addEventListener(
            "click",
            function () {

                openUploadModal("music");

            }
        );

    }

}


/* =========================================
   OPEN UPLOAD MODAL
   ========================================= */

function openUploadModal(type) {

    currentUploadType =
        type;


    const title =
        $("uploadModalTitle");

    const fileInput =
        $("mediaFile");


    if (title) {

        if (type === "photo") {

            title.textContent =
                "Add Photo";

        } else if (type === "video") {

            title.textContent =
                "Add Video";

        } else if (type === "music") {

            title.textContent =
                "Add Song";

        } else {

            title.textContent =
                "Add Memory";

        }

    }


    if (fileInput) {

        fileInput.value = "";


        if (type === "photo") {

            fileInput.accept =
                "image/*";

        } else if (type === "video") {

            fileInput.accept =
                "video/*";

        } else if (type === "music") {

            fileInput.accept =
                "audio/*";

        } else {

            fileInput.accept =
                "image/*,video/*,audio/*";

        }

    }


    openModal(
        "uploadModal"
    );

}


/* =========================================
   FILE VALIDATION
   ========================================= */

function isValidFileForType(
    file,
    type
) {

    if (!file) {
        return false;
    }


    if (type === "photo") {

        return file.type.startsWith(
            "image/"
        );

    }


    if (type === "video") {

        return file.type.startsWith(
            "video/"
        );

    }


    if (type === "music") {

        return file.type.startsWith(
            "audio/"
        );

    }


    return true;

}


/* =========================================
   FORMAT FILE SIZE
   ========================================= */

function formatFileSize(bytes) {

    if (!bytes) {
        return "0 B";
    }


    const units = [
        "B",
        "KB",
        "MB",
        "GB"
    ];


    const index =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );


    const safeIndex =
        Math.min(
            index,
            units.length - 1
        );


    return (
        bytes /
        Math.pow(
            1024,
            safeIndex
        )
    ).toFixed(1)
    + " "
    + units[safeIndex];

}


/* =========================================
   FORMAT DATE
   ========================================= */

function formatDate(
    dateValue
) {

    if (!dateValue) {
        return "";
    }


    const date =
        new Date(dateValue);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }


    return date.toLocaleDateString(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );

}


/* =========================================
   SAFE HTML
   ========================================= */

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================
   FILE NAME CLEANING
   ========================================= */

function cleanFileName(
    fileName
) {

    return fileName
        .replace(
            /[^a-zA-Z0-9._-]/g,
            "_"
        );

}


/* =========================================
   CREATE STORAGE PATH
   ========================================= */

function createStoragePath(
    type,
    file
) {

    const timestamp =
        Date.now();


    const random =
        Math.random()
            .toString(36)
            .substring(2, 9);


    const cleanName =
        cleanFileName(
            file.name
        );


    return (
        type +
        "/" +
        timestamp +
        "_" +
        random +
        "_" +
        cleanName
    );

}


/* =========================================
   INITIAL APP SETUP
   ========================================= */

async function initializeApp() {

    initializeLogin();

    initializeLogout();

    initializeNavigation();

    initializeModals();

    initializeImageViewer();

    initializeUploadButtons();
   
    initializeSettingsControls();
   
    initializeMusicBackgroundSettings();

loadHeroGalleryPhotos();

initializeSiteBackgroundSettings();

loadSavedSiteBackground();
 

    const messageButton =
        $("addMessageButton");


    if (messageButton) {

        messageButton.addEventListener(
            "click",
            function () {

                openModal(
                    "messageModal"
                );

            }
        );

    }


    checkLogin();

}


/* =========================================
   START APPLICATION
   ========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeApp();

    }
);
/* =========================================
   LEON & MAJICA — APP.JS
   PART 2
   SUPABASE + MEDIA
   ========================================= */


/* =========================================
   DATABASE SETTINGS
   ========================================= */

const MEDIA_TABLE = "media";

const STORAGE_BUCKET = "memories";


/* =========================================
   CHECK SUPABASE
   ========================================= */

function requireSupabase() {

    if (!supabaseClient) {

        throw new Error(
            "Supabase is not initialized."
        );

    }

}


/* =========================================
   GET MEDIA RECORDS
   ========================================= */

async function getMediaRecords() {

    requireSupabase();


    const {
        data,
        error
    } = await supabaseClient
        .from(MEDIA_TABLE)
        .select("*")
        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "Error loading media:",
            error
        );

        throw error;

    }


    return data || [];

}


/* =========================================
   GET SIGNED URL
   ========================================= */

async function getSignedUrl(
    filePath,
    expiresIn = 3600
) {

    requireSupabase();


    if (!filePath) {
        return null;
    }


    const {
        data,
        error
    } = await supabaseClient
        .storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(
            filePath,
            expiresIn
        );


    if (error) {

        console.error(
            "Signed URL error:",
            error
        );

        return null;

    }


    return data?.signedUrl || null;

}
/* =========================================
   SITE BACKGROUND SETTINGS
   ========================================= */

async function getSiteBackgroundSettings() {

    requireSupabase();

    const {
        data,
        error
    } = await supabaseClient
        .from("site_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error(
            "Error loading site background settings:",
            error
        );
        return null;
    }

    return data;
}


async function saveSiteBackgroundSettings(
    backgroundPath,
    backgroundSource,
    brightness
) {

    requireSupabase();

    const {
        data: existing,
        error: existingError
    } = await supabaseClient
        .from("site_settings")
        .select("id")
        .limit(1)
        .maybeSingle();

    if (existingError) {
        throw existingError;
    }

    const settings = {
        background_path: backgroundPath || null,
        background_source:
            backgroundSource || "gallery",
        background_brightness:
            Number(brightness) || 45,
        updated_at:
            new Date().toISOString()
    };

    let result;

    if (existing?.id) {

        result = await supabaseClient
            .from("site_settings")
            .update(settings)
            .eq("id", existing.id)
            .select()
            .single();

    } else {

        result = await supabaseClient
            .from("site_settings")
            .insert(settings)
            .select()
            .single();

    }

    if (result.error) {
        console.error(
            "Error saving site background settings:",
            result.error
        );

        throw result.error;
    }

    return result.data;
}
/* =========================================
   APPLY SAVED SITE BACKGROUND
   ========================================= */

async function loadSavedSiteBackground() {

    try {

        const settings =
            await getSiteBackgroundSettings();

        if (!settings?.background_path) {
            return;
        }

        const imageUrl =
            await getSignedUrl(
                settings.background_path
            );

        if (!imageUrl) {
            return;
        }

        const brightness =
            Number(
                settings.background_brightness ?? 45
            );

        const darkness =
            1 - brightness / 100;

        document.body.style.backgroundImage =
            `linear-gradient(
                rgba(0,0,0,${darkness}),
                rgba(0,0,0,${darkness})
            ), url("${imageUrl}")`;

        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "center";
        document.body.style.backgroundAttachment = "fixed";
        document.body.style.backgroundRepeat = "no-repeat";

    } catch (error) {

        console.error(
            "Error loading saved website background:",
            error
        );

    }

}
/* =========================================
   UPLOAD FILE
   ========================================= */

async function uploadMediaFile(
    file,
    type
) {

    requireSupabase();


    if (!file) {

        throw new Error(
            "Please select a file."
        );

    }


    if (
        !isValidFileForType(
            file,
            type
        )
    ) {

        throw new Error(
            "The selected file is not valid for this upload."
        );

    }


    const filePath =
        createStoragePath(
            type,
            file
        );


    /*
       Upload to Supabase Storage
    */

    const {
        error: uploadError
    } = await supabaseClient
        .storage
        .from(STORAGE_BUCKET)
        .upload(
            filePath,
            file,
            {
                cacheControl: "3600",
                upsert: false,
                contentType: file.type
            }
        );


    if (uploadError) {

        console.error(
            "Storage upload error:",
            uploadError
        );

        throw uploadError;

    }


    /*
       Save information in database
    */

    const {
        data,
        error: databaseError
    } = await supabaseClient
        .from(MEDIA_TABLE)
        .insert({
            file_name: file.name,
            file_path: filePath,
            file_type: type,
            mime_type: file.type,
            file_size: file.size
        })
        .select()
        .single();


    if (databaseError) {

        /*
           If database insertion fails,
           attempt to remove the uploaded file.
        */

        await supabaseClient
            .storage
            .from(STORAGE_BUCKET)
            .remove([
                filePath
            ]);


        console.error(
            "Database insert error:",
            databaseError
        );

        throw databaseError;

    }


    return data;

}


/* =========================================
   UPLOAD BUTTON HANDLER
   ========================================= */

async function handleUpload() {

    const fileInput =
        $("mediaFile");


    if (!fileInput) {
        return;
    }


    const file =
        fileInput.files?.[0];


    if (!file) {

        showNotification(
            "Please choose a file first.",
            "⚠️"
        );

        return;

    }


    if (!currentUploadType) {

        showNotification(
            "Please select an upload type.",
            "⚠️"
        );

        return;

    }


    if (
        !isValidFileForType(
            file,
            currentUploadType
        )
    ) {

        showNotification(
            "That file type is not valid here.",
            "⚠️"
        );

        return;

    }


    const uploadButton =
        $("confirmUploadButton");

    const progress =
        $("uploadProgress");

    const progressFill =
        $("progressFill");

    const progressText =
        $("progressText");


    try {

        if (uploadButton) {

            uploadButton.disabled =
                true;

            uploadButton.textContent =
                "Uploading...";

        }


        showElement(progress);


        if (progressFill) {

            progressFill.style.width =
                "20%";

        }


        if (progressText) {

            progressText.textContent =
                "Uploading your memory...";

        }


        await uploadMediaFile(
            file,
            currentUploadType
        );


        if (progressFill) {

            progressFill.style.width =
                "100%";

        }


        if (progressText) {

            progressText.textContent =
                "Upload complete ❤️";

        }


        showNotification(
            "Memory uploaded successfully!",
            "❤️"
        );


        setTimeout(
            async function () {

                closeModal(
                    "uploadModal"
                );


                if (progressFill) {

                    progressFill.style.width =
                        "0%";

                }


                hideElement(
                    progress
                );


                if (uploadButton) {

                    uploadButton.disabled =
                        false;

                    uploadButton.textContent =
                        "Upload ❤️";

                }


                await loadAllMemories();

            },
            500
        );


    } catch (error) {

        console.error(
            "Upload failed:",
            error
        );


        let message =
            "Upload failed.";


        if (
            error?.message
        ) {

            message =
                error.message;

        }


        showNotification(
            message,
            "⚠️"
        );


        if (progressText) {

            progressText.textContent =
                "Upload failed.";

        }


        if (uploadButton) {

            uploadButton.disabled =
                false;

            uploadButton.textContent =
                "Upload ❤️";

        }

    }

}


/* =========================================
   INITIALIZE UPLOAD CONFIRM BUTTON
   ========================================= */

function initializeUploadHandler() {

    const button =
        $("confirmUploadButton");


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        handleUpload
    );

}
/* =========================================
   SAVE MEDIA CAPTION
   ========================================= */

async function saveMediaCaption(mediaId, caption) {

    try {

        requireSupabase();

        const {
            error
        } = await supabaseClient
            .from("media")
            .update({
                caption: caption.trim() || null
            })
            .eq("id", mediaId);

        if (error) {
            throw error;
        }

        console.log("Media caption saved.");

    } catch (error) {

        console.error(
            "Error saving media caption:",
            error
        );

    }
}
/* =========================================
   CREATE IMAGE CARD
   ========================================= */

function createPhotoCard(item) {
    const url = item.signed_url || "";

    return `
        <div class="media-card">
            <div class="media-image-wrap">
                <img
                    src="${url}"
                    alt="${escapeHtml(item.file_name)}"
                    class="media-image"
                    onclick="openImageViewerForPhoto('${item.id}')"
                >
            </div>

            <div class="media-info">

                <div class="caption-editor">
    <textarea
        class="media-caption"
        placeholder="Write something about this memory..."
        data-media-id="${item.id}"
    >${escapeHtml(item.caption || "")}</textarea>

    <button
        class="save-caption-button"
        onclick="saveMediaCaption('${item.id}', this.previousElementSibling.value)"
    >
        💾 Save
    </button>
</div>

                <div class="memory-date">
                    📅 ${formatMemoryDate(item.created_at)}
                </div>

                <div class="media-actions">
                    <button
                        class="favorite-button ${item.is_favorite ? "active" : ""}"
                        onclick="toggleMediaFavorite('${item.id}', ${item.is_favorite})"
                    >
                        ${item.is_favorite ? "❤️" : "♡"}
                    </button>

                    <button
                        class="delete-button"
                        onclick='confirmDeleteMedia(${JSON.stringify(item).replace(/'/g, "&#39;")})'
                    >
                        🗑️
                    </button>
                </div>

            </div>
        </div>
    `;
}


/* =========================================
   CREATE VIDEO CARD
   ========================================= */

function createVideoCard(item) {
    const url = item.signed_url || "";

    return `
        <div class="media-card">
            <div class="media-video-wrap">
                <video
                    class="media-video"
                    controls
                    preload="metadata"
                >
                    <source
                        src="${url}"
                        type="${item.mime_type || "video/mp4"}"
                    >
                </video>
            </div>

            <div class="media-info">

                <textarea
    class="media-caption"
    placeholder="Write something about this memory..."
    data-media-id="${item.id}"
    onblur="saveMediaCaption('${item.id}', this.value)"
>${escapeHtml(item.caption || "")}</textarea>
                <div class="memory-date">
                    📅 ${formatMemoryDate(item.created_at)}
                </div>

                <div class="media-actions">
                    <button
                        class="favorite-button ${item.is_favorite ? "active" : ""}"
                        onclick="toggleMediaFavorite('${item.id}', ${item.is_favorite})"
                    >
                        ${item.is_favorite ? "❤️" : "♡"}
                    </button>

                    <button
                        class="delete-button"
                        onclick='confirmDeleteMedia(${JSON.stringify(item).replace(/'/g, "&#39;")})'
                    >
                        🗑️
                    </button>
                </div>

            </div>
        </div>
    `;
}


/* =========================================
   CREATE MUSIC ITEM
   ========================================= */

function createMusicItem(item, index) {
    return `
        <div class="music-item">
            <button
                class="music-play-button"
                onclick="playSong(${index})"
                aria-label="Play song"
            >
                ▶
            </button>

            <div class="music-info">
                <div class="music-title">
                    ${escapeHtml(item.file_name)}
                </div>

                <div class="memory-date">
                    📅 ${formatMemoryDate(item.created_at)}
                </div>
            </div>

            <div class="music-actions">
                <button
                    class="favorite-button ${item.is_favorite ? "active" : ""}"
                    onclick="toggleMediaFavorite('${item.id}', ${item.is_favorite})"
                >
                    ${item.is_favorite ? "❤️" : "♡"}
                </button>

                <button
                    class="delete-button"
                    onclick='confirmDeleteMedia(${JSON.stringify(item).replace(/'/g, "&#39;")})'
                >
                    🗑️
                </button>
            </div>
        </div>
    `;
}


/* =========================================
   LOAD PHOTOS
   ========================================= */
 
async function loadPhotos(records) {
    const grid = $("photoGrid");
    if (!grid) {
        console.error("Photo gallery element #photoGrid not found.");
        return;
    }

    grid.innerHTML = "";

    const photos = (records || []).filter(
        item => item.file_type === "photo"
    );
   viewerPhotoList = photos.map(item => ({
    ...item,
    signed_url: "",
}));

viewerPhotoIndex = 0;

    if (photos.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div>📸</div>
                <p>No photos yet.</p>
            </div>
        `;
        return;
    }

    for (const item of photos) {
        try {
            const url = await getSignedUrl(item.file_path);

            if (!url) {
                console.error("Photo URL unavailable:", item.file_path);
                continue;
            }

            const photoIndex = viewerPhotoList.findIndex(
    photo => String(photo.id) === String(item.id)
);

if (photoIndex !== -1) {
    viewerPhotoList[photoIndex].signed_url = url;
}

const card = createPhotoCard({
    ...item,
    signed_url: url
});

            grid.insertAdjacentHTML("beforeend", card);
        } catch (error) {
            console.error("Photo display error:", error);
        }
    }
}

/* =========================================
   LOAD VIDEOS
   ========================================= */

async function loadVideos(records) {
    const grid = $("videoGrid");
    if (!grid) {
        console.error("Video gallery element #videoGrid not found.");
        return;
    }

    grid.innerHTML = "";

    const videos = (records || []).filter(
        item => item.file_type === "video"
    );

    if (videos.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div>🎥</div>
                <p>No videos yet.</p>
            </div>
        `;
        return;
    }

    for (const item of videos) {
        try {
            const url = await getSignedUrl(item.file_path);

            if (!url) {
                console.error("Video URL unavailable:", item.file_path);
                continue;
            }

            const card = createVideoCard({
                ...item,
                signed_url: url
            });

            grid.insertAdjacentHTML("beforeend", card);
        } catch (error) {
            console.error("Video display error:", error);
        }
    }
}


/* =========================================
   LOAD MUSIC
   ========================================= */

function loadMusic(records) {

    const list = $("musicList");

    if (!list) {
        return;
    }

    list.innerHTML = "";

    currentPlaylist = records.filter(
        function (item) {
            return item.file_type === "music";
        }
    );
   /*
 * Restore the last saved song
 * after the playlist has been loaded.
 */
if (
    typeof window.lastSavedSongIndex === "number" &&
    window.lastSavedSongIndex >= 0 &&
    window.lastSavedSongIndex < currentPlaylist.length
) {

    restoreLastMusicPlayerState();

}

    if (currentPlaylist.length === 0) {

        list.innerHTML = `
            <div class="empty-state">
                <div>🎵</div>
                <p>No songs yet.</p>
            </div>
        `;

        return;
    }

    currentPlaylist.forEach(
        function (item, index) {

            const row =
                createMusicItem(
                    item,
                    index
                );

            list.insertAdjacentHTML(
                "beforeend",
                row
            );

        }
    );

}

/* =========================================
   UPDATE COUNTS
   ========================================= */

function updateMemoryCounts(
    records
) {

    const photos =
        records.filter(
            item =>
                item.file_type === "photo"
        ).length;


    const videos =
        records.filter(
            item =>
                item.file_type === "video"
        ).length;


    const music =
        records.filter(
            item =>
                item.file_type === "music"
        ).length;


    const photoCount =
        $("photoCount");

    const videoCount =
        $("videoCount");

    const musicCount =
        $("musicCount");


    if (photoCount) {

        photoCount.textContent =
            photos;

    }


    if (videoCount) {

        videoCount.textContent =
            videos;

    }


    if (musicCount) {

        musicCount.textContent =
            music;

    }

}


/* =========================================
   LOAD RECENT MEMORIES
   ========================================= */


async function loadRecentMemories(records) {
    const container = $("recentMemories");
    if (!container) return;

    container.innerHTML = "";

    const recent = (records || []).slice(0, 8);

    if (recent.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div>❤️</div>
                <p>Your memories will appear here.</p>
            </div>
        `;
        return;
    }

    for (const item of recent) {
        const card = document.createElement("div");
        card.className = "media-card";

        const name = escapeHtml(item.file_name || "Memory");

        try {
            const url = await getSignedUrl(item.file_path);

            if (!url) {
                console.error("Cannot load memory:", item.file_path);
                continue;
            }

            if (item.file_type === "photo") {
                card.innerHTML = `
                    <img
                        class="media-image"
                        src="${url}"
                        alt="${name}"
                        loading="lazy"
                    >
                    <div class="media-info">${name}</div>
                `;

                card.style.cursor = "pointer";
                card.addEventListener("click", () => {
                    openImageViewer(url, item.file_name || "Memory");
                });

            } else if (item.file_type === "video") {
                card.innerHTML = `
                    <video
                        class="media-video"
                        src="${url}"
                        controls
                        playsinline
                        preload="metadata"
                    ></video>
                    <div class="media-info">${name}</div>
                `;

                // Keep the video controls clickable.
                const video = card.querySelector("video");
                video.addEventListener("error", () => {
                    console.error("Video failed to load:", item.file_name);
                });

            } else if (item.file_type === "music") {
                card.innerHTML = `
                    <div class="home-music-preview">
                        <div class="home-music-icon">🎵</div>
                        <div class="media-info">${name}</div>
                        <button type="button" class="home-play-button">
                            ▶ Play song
                        </button>
                    </div>
                `;

                const playButton = card.querySelector(".home-play-button");

                playButton.addEventListener("click", async (event) => {
                    event.stopPropagation();

                    const index = currentPlaylist.findIndex(song =>
                        song.file_path === item.file_path
                    );

                    if (index !== -1) {
                        await playSong(index);
                    } else {
                        showNotification(
                            "Song not found in the music playlist.",
                            "⚠️"
                        );
                    }
                });

            } else {
                card.innerHTML = `
                    <div class="empty-state">
                        <div>❤️</div>
                        <p>${name}</p>
                    </div>
                `;
            }

            container.appendChild(card);

        } catch (error) {
            console.error("Could not display memory:", error);
        }
    }
}


/* =========================================
   LOAD ALL MEMORIES
   ========================================= */

async function loadAllMemories() {

    if (!supabaseClient) {

        const initialized =
            await initializeSupabase();


        if (!initialized) {
            return;
        }

    }


    try {

        const records =
            await getMediaRecords();


        updateMemoryCounts(
            records
        );


        await loadRecentMemories(records);


        await loadPhotos(
            records
        );


        await loadVideos(
            records
        );


        loadMusic(
            records
        );


        /*
           Messages are loaded by the next
           section of app.js.
        */

        if (
            typeof loadMessages ===
            "function"
        ) {

            await loadMessages();

        }


    } catch (error) {

        console.error(
            "Could not load memories:",
            error
        );


        showNotification(
            "Could not load your memories.",
            "⚠️"
        );

    }

}


/* =========================================
   INITIALIZE PART 2
   ========================================= */

initializeUploadHandler();
/* =========================================
   LEON & MAJICA — APP.JS
   PART 3
   MUSIC PLAYER + MESSAGES
   ========================================= */


/* =========================================
   MUSIC PLAYER
   ========================================= */

async function playSong(index) {

    if (!currentPlaylist[index]) {
        return;
    }


    currentSongIndex =
        index;


    const song =
        currentPlaylist[index];


    try {

        const url =
            await getSignedUrl(
                song.file_path
            );


        const player =
            $("audioPlayer");


        if (!player || !url) {

            showNotification(
                "Unable to play this song.",
                "⚠️"
            );

            return;

        }


        player.src =
            url;


        const title =
            $("currentSongTitle");


        const artist =
            $("currentSongArtist");


        if (title) {

            title.textContent =
                song.file_name ||
                "Untitled Song";

        }


        if (artist) {

            artist.textContent =
                "Leon & Majica";

        }


        await player.play();


        updateSongButtons();


    } catch (error) {

        console.error(
            "Music playback error:",
            error
        );


        showNotification(
            "Unable to play this song.",
            "⚠️"
        );

    }

}


/* =========================================
   UPDATE MUSIC BUTTONS
   ========================================= */

function updateSongButtons() {

    const buttons =
        document.querySelectorAll(
            ".song-play-button"
        );


    buttons.forEach(
        function (button, index) {

            if (
                index === currentSongIndex
            ) {

                button.textContent =
                    "❚❚";

            } else {

                button.textContent =
                    "▶";

            }

        }
    );

}


/* =========================================
   INITIALIZE AUDIO PLAYER
   ========================================= */

function initializeAudioPlayer() {

    const player =
        $("audioPlayer");

    if (!player) {
        return;
    }

    player.addEventListener(
        "play",
        function () {

            updateSongButtons();

        }
    );

    player.addEventListener(
        "pause",
        function () {

            updateSongButtons();

        }
    );

}


/* =========================================
   MESSAGE DATABASE TABLE
   ========================================= */

const MESSAGE_TABLE =
    "messages";


/* =========================================
   LOAD MESSAGES
   ========================================= */

async function loadMessages() {

    requireSupabase();


    const list =
        $("messageList");


    if (!list) {
        return;
    }


    try {

        const {
            data,
            error
        } = await supabaseClient
            .from(MESSAGE_TABLE)
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {

            /*
               If the messages table hasn't been
               created yet, don't break the rest
               of the website.
            */

            console.error(
                "Message loading error:",
                error
            );

            return;

        }


        list.innerHTML = "";


        const messages =
            data || [];


        const messageCount =
            $("messageCount");


        if (messageCount) {

            messageCount.textContent =
                messages.length;

        }


        if (
            messages.length === 0
        ) {

            list.innerHTML = `
                <div class="empty-state">
                    <div>💌</div>
                    <p>No messages yet.</p>
                </div>
            `;

            return;

        }


        messages.forEach(
            function (message) {

                const card =
                    createMessageCard(
                        message
                    );


                list.appendChild(
                    card
                );

            }
        );


    } catch (error) {

        console.error(
            "Could not load messages:",
            error
        );

    }

}


/* =========================================
   CREATE MESSAGE CARD
   ========================================= */

function createMessageCard(
    message
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "message-card";


    const title =
        escapeHtml(
            message.title ||
            "A Message"
        );


    const text =
        escapeHtml(
            message.message ||
            message.content ||
            ""
        );


    const date =
        formatDate(
            message.created_at
        );


    card.innerHTML = `
        <h3>${title}</h3>

        <p>${text}</p>

        <span class="message-date">
            ${escapeHtml(date)}
        </span>
    `;


    return card;

}


/* =========================================
   SAVE MESSAGE
   ========================================= */

async function saveMessage(
    title,
    message
) {

    requireSupabase();


    const cleanTitle =
        String(title || "")
            .trim();


    const cleanMessage =
        String(message || "")
            .trim();


    if (!cleanTitle) {

        throw new Error(
            "Please enter a title."
        );

    }


    if (!cleanMessage) {

        throw new Error(
            "Please write a message."
        );

    }


    const {
        data,
        error
    } = await supabaseClient
        .from(MESSAGE_TABLE)
        .insert({
            title: cleanTitle,
            message: cleanMessage
        })
        .select()
        .single();


    if (error) {

        console.error(
            "Save message error:",
            error
        );

        throw error;

    }


    return data;

}


/* =========================================
   INITIALIZE MESSAGE FORM
   ========================================= */

function initializeMessageForm() {

    const form =
        $("messageForm");


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const titleInput =
                $("messageTitle");


            const messageInput =
                $("messageText");


            const submitButton =
                form.querySelector(
                    'button[type="submit"]'
                );


            const title =
                titleInput?.value.trim();


            const message =
                messageInput?.value.trim();


            if (!title || !message) {

                showNotification(
                    "Please fill in the message.",
                    "⚠️"
                );

                return;

            }


            try {

                if (submitButton) {

                    submitButton.disabled =
                        true;

                    submitButton.textContent =
                        "Saving...";

                }


                await saveMessage(
                    title,
                    message
                );


                if (titleInput) {

                    titleInput.value =
                        "";

                }


                if (messageInput) {

                    messageInput.value =
                        "";

                }


                closeModal(
                    "messageModal"
                );


                showNotification(
                    "Message saved ❤️",
                    "💌"
                );


                await loadMessages();


                /*
                   Update home page count as well.
                */

                const records =
                    await getMediaRecords();


                updateMemoryCounts(
                    records
                );


            } catch (error) {

                console.error(
                    "Message save failed:",
                    error
                );


                showNotification(
                    error?.message ||
                    "Unable to save message.",
                    "⚠️"
                );


            } finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Save Message ❤️";

                }

            }

        }
    );

}


/* =========================================
   DELETE MEDIA
   ========================================= */

async function deleteMedia(
    item
) {

    requireSupabase();


    if (!item?.id) {
        return false;
    }


    try {

        /*
           Delete file from storage first.
        */

        if (item.file_path) {

            const {
                error: storageError
            } = await supabaseClient
                .storage
                .from(STORAGE_BUCKET)
                .remove([
                    item.file_path
                ]);


            if (storageError) {

                console.warn(
                    "Storage delete warning:",
                    storageError
                );

            }

        }


        /*
           Delete database record.
        */

        const {
            error: databaseError
        } = await supabaseClient
            .from(MEDIA_TABLE)
            .delete()
            .eq(
                "id",
                item.id
            );


        if (databaseError) {

            throw databaseError;

        }


        return true;


    } catch (error) {

        console.error(
            "Delete media error:",
            error
        );

        showNotification(
            "Unable to delete this memory.",
            "⚠️"
        );

        return false;

    }

}


/* =========================================
   DELETE MESSAGE
   ========================================= */

async function deleteMessage(
    messageId
) {

    requireSupabase();


    if (!messageId) {
        return false;
    }


    try {

        const {
            error
        } = await supabaseClient
            .from(MESSAGE_TABLE)
            .delete()
            .eq(
                "id",
                messageId
            );


        if (error) {

            throw error;

        }


        await loadMessages();


        showNotification(
            "Message deleted.",
            "🗑️"
        );


        return true;


    } catch (error) {

        console.error(
            "Delete message error:",
            error
        );


        showNotification(
            "Unable to delete message.",
            "⚠️"
        );


        return false;

    }

}


/* =========================================
   REFRESH SIGNED URL
   ========================================= */

async function refreshMediaUrl(
    filePath
) {

    if (!filePath) {
        return null;
    }


    /*
       Signed URLs expire, so this function
       can always request a fresh one.
    */

    return await getSignedUrl(
        filePath,
        3600
    );

}


/* =========================================
   INITIALIZE PART 3
   ========================================= */

/* LEON & MAJICA — MUSIC PLAYER v2 */

const musicPlayer =
    document.getElementById("audioPlayer");

const previousButton =
    document.getElementById("previousSongButton");

const playPauseButton =
    document.getElementById("playPauseButton");

const nextButton =
    document.getElementById("nextSongButton");

const shuffleButton =
    document.getElementById("shuffleSongButton");

const repeatButton =
    document.getElementById("repeatSongButton");

const MUSIC_PLAYER_STORAGE_KEY =
    "leonMajicaMusicPlayerState";

let shuffleEnabled = false;
let repeatMode = "off";
let restorePlaybackPosition = null;


/* SAVE PLAYER STATE */

function saveMusicPlayerState() {

    if (!musicPlayer) return;

    try {

        localStorage.setItem(
            MUSIC_PLAYER_STORAGE_KEY,
            JSON.stringify({
                songIndex: currentSongIndex,
                currentTime:
                    Number.isFinite(
                        musicPlayer.currentTime
                    )
                        ? musicPlayer.currentTime
                        : 0,
                shuffleEnabled,
                repeatMode
            })
        );

    } catch (error) {

        console.warn(
            "Could not save music player state:",
            error
        );
    }
}


/* LOAD PLAYER STATE */

function loadMusicPlayerState() {

    try {

        const saved =
            localStorage.getItem(
                MUSIC_PLAYER_STORAGE_KEY
            );

        if (!saved) return null;

        const state = JSON.parse(saved);

        if (
    typeof state.songIndex === "number" &&
    state.songIndex >= 0
) {

    restorePlaybackPosition =
        Math.max(
            0,
            Number(state.currentTime) || 0
        );

    /*
     * Remember which song was playing.
     * It will be restored after the playlist loads.
     */
    window.lastSavedSongIndex =
        state.songIndex;
}

        if (
            typeof state.shuffleEnabled ===
            "boolean"
        ) {

            shuffleEnabled =
                state.shuffleEnabled;
        }

        if (
            state.repeatMode === "off" ||
            state.repeatMode === "all" ||
            state.repeatMode === "one"
        ) {

            repeatMode =
                state.repeatMode;
        }

        return state;

    } catch (error) {

        console.warn(
            "Could not load music player state:",
            error
        );

        return null;
    }
}


/* UPDATE BUTTONS */

function updateSongButtons() {

    document
        .querySelectorAll(".music-play-button")
        .forEach(button => {

            const index =
                Number(button.dataset.index);

            if (
                index === currentSongIndex &&
                musicPlayer &&
                !musicPlayer.paused
            ) {

                button.textContent = "❚❚";

            } else {

                button.textContent = "▶";
            }
        });
}


function updatePlayPauseButton() {

    if (!playPauseButton || !musicPlayer) {
        return;
    }

    playPauseButton.textContent =
        musicPlayer.paused ? "▶" : "❚❚";
}


function updateShuffleButton() {

    if (!shuffleButton) return;

    shuffleButton.classList.toggle(
        "active",
        shuffleEnabled
    );

    shuffleButton.setAttribute(
        "aria-pressed",
        String(shuffleEnabled)
    );

    shuffleButton.title =
        shuffleEnabled
            ? "Shuffle is ON"
            : "Shuffle is OFF";
}


function updateRepeatButton() {

    if (!repeatButton) return;

    repeatButton.classList.toggle(
        "active",
        repeatMode !== "off"
    );

    repeatButton.setAttribute(
        "aria-pressed",
        String(repeatMode !== "off")
    );

    if (repeatMode === "one") {

        repeatButton.textContent = "🔂";
        repeatButton.title = "Repeat one";

    } else {

        repeatButton.textContent = "🔁";

        repeatButton.title =
            repeatMode === "all"
                ? "Repeat all"
                : "Repeat off";
    }
}


/* SHUFFLE */

function toggleShuffle() {

    shuffleEnabled =
        !shuffleEnabled;

    updateShuffleButton();
    saveMusicPlayerState();
}


/* REPEAT */

function toggleRepeat() {

    if (repeatMode === "off") {

        repeatMode = "all";

    } else if (repeatMode === "all") {

        repeatMode = "one";

    } else {

        repeatMode = "off";
    }

    updateRepeatButton();
    saveMusicPlayerState();
}


/* NEXT SONG */

function getNextSongIndex() {

    if (
        !currentPlaylist ||
        currentPlaylist.length === 0
    ) {

        return -1;
    }

    if (repeatMode === "one") {
        return currentSongIndex;
    }

    if (shuffleEnabled) {

        if (currentPlaylist.length === 1) {
            return currentSongIndex;
        }

        let randomIndex;

        do {

            randomIndex =
                Math.floor(
                    Math.random() *
                    currentPlaylist.length
                );

        } while (
            randomIndex === currentSongIndex
        );

        return randomIndex;
    }

    const nextIndex =
        currentSongIndex + 1;

    if (
        nextIndex <
        currentPlaylist.length
    ) {

        return nextIndex;
    }

    return repeatMode === "all"
        ? 0
        : -1;
}


/* PREVIOUS SONG */

function getPreviousSongIndex() {

    if (
        !currentPlaylist ||
        currentPlaylist.length === 0
    ) {

        return -1;
    }

    if (currentSongIndex > 0) {
        return currentSongIndex - 1;
    }

    return repeatMode === "all"
        ? currentPlaylist.length - 1
        : -1;
}


async function playNextSong() {

    const index =
        getNextSongIndex();

    if (index >= 0) {
        await playSong(index);
    }
}


async function playPreviousSong() {

    if (
        musicPlayer &&
        musicPlayer.currentTime > 3
    ) {

        musicPlayer.currentTime = 0;
        saveMusicPlayerState();
        return;
    }

    const index =
        getPreviousSongIndex();

    if (index >= 0) {
        await playSong(index);
    }
}


/* MEDIA SESSION */

function updateMusicMediaSession() {

    if (
        !musicPlayer ||
        !("mediaSession" in navigator)
    ) {

        return;
    }

    const title =
        document
            .getElementById(
                "currentSongTitle"
            )
            ?.textContent
            ?.trim() ||
        "Leon & Majica";

    const artist =
        document
            .getElementById(
                "currentSongArtist"
            )
            ?.textContent
            ?.trim() ||
        "Leon & Majica";

    const artworkElement =
        document.getElementById("albumArt");

    const image =
        artworkElement?.querySelector("img");

    let artwork = [];

    if (image?.src) {

        artwork = [
            {
                src: image.src,
                sizes: "96x96",
                type: "image/jpeg"
            },
            {
                src: image.src,
                sizes: "256x256",
                type: "image/jpeg"
            },
            {
                src: image.src,
                sizes: "512x512",
                type: "image/jpeg"
            }
        ];
    }

    try {

        navigator.mediaSession.metadata =
            new MediaMetadata({
                title,
                artist,
                album:
                    "Leon & Majica — Our Memories",
                artwork
            });

    } catch (error) {

        console.warn(
            "Media metadata error:",
            error
        );
    }
}


function updatePlaybackState() {

    if (
        !musicPlayer ||
        !("mediaSession" in navigator)
    ) {

        return;
    }

    try {

        navigator.mediaSession.playbackState =
            musicPlayer.paused
                ? "paused"
                : "playing";

        if (
            Number.isFinite(
                musicPlayer.duration
            ) &&
            musicPlayer.duration > 0
        ) {

            navigator.mediaSession.setPositionState({
                duration:
                    musicPlayer.duration,

                playbackRate:
                    musicPlayer.playbackRate || 1,

                position:
                    Math.min(
                        musicPlayer.currentTime,
                        musicPlayer.duration
                    )
            });
        }

    } catch (error) {

        console.warn(
            "Media Session update error:",
            error
        );
    }
}

async function restoreLastMusicPlayerState() {

    const savedIndex =
        window.lastSavedSongIndex;

    if (
        typeof savedIndex !== "number" ||
        !currentPlaylist ||
        !currentPlaylist.length
    ) {
        return;
    }

    if (
        savedIndex < 0 ||
        savedIndex >= currentPlaylist.length
    ) {
        return;
    }

    /*
     * Load the saved song.
     * The saved playback position will be
     * restored by the loadedmetadata event.
     */
    await playSong(savedIndex);

    window.lastSavedSongIndex = null;
}
/* INITIALIZE PLAYER */

function initializeMusicPlayerV2() {

    if (!musicPlayer) return;

    loadMusicPlayerState();
   
    updateShuffleButton();
    updateRepeatButton();
    updatePlayPauseButton();
    updateSongButtons();

    musicPlayer.addEventListener(
        "play",
        () => {

            updatePlayPauseButton();
            updateSongButtons();
            updatePlaybackState();
            saveMusicPlayerState();
        }
    );

    musicPlayer.addEventListener(
        "pause",
        () => {

            updatePlayPauseButton();
            updateSongButtons();
            updatePlaybackState();
            saveMusicPlayerState();
        }
    );

    musicPlayer.addEventListener(
        "timeupdate",
        () => {

            saveMusicPlayerState();
            updatePlaybackState();
        }
    );

    musicPlayer.addEventListener(
        "loadedmetadata",
        () => {

            if (
                restorePlaybackPosition !== null
            ) {

                try {

                    musicPlayer.currentTime =
                        Math.min(
                            restorePlaybackPosition,
                            musicPlayer.duration || 0
                        );

                } catch (error) {}

                restorePlaybackPosition = null;
            }

            updatePlaybackState();
        }
    );

    musicPlayer.addEventListener(
        "ended",
        async () => {

            if (repeatMode === "one") {

                musicPlayer.currentTime = 0;

                try {
                    await musicPlayer.play();
                } catch (error) {}

                return;
            }

            await playNextSong();
        }
    );

    if ("mediaSession" in navigator) {

        try {

            navigator.mediaSession.setActionHandler(
                "play",
                () => musicPlayer.play()
            );

            navigator.mediaSession.setActionHandler(
                "pause",
                () => musicPlayer.pause()
            );

            navigator.mediaSession.setActionHandler(
                "previoustrack",
                playPreviousSong
            );

            navigator.mediaSession.setActionHandler(
                "nexttrack",
                playNextSong
            );

            navigator.mediaSession.setActionHandler(
                "seekbackward",
                details => {

                    musicPlayer.currentTime =
                        Math.max(
                            0,
                            musicPlayer.currentTime -
                            (details.seekOffset || 10)
                        );

                    saveMusicPlayerState();
                }
            );

            navigator.mediaSession.setActionHandler(
                "seekforward",
                details => {

                    musicPlayer.currentTime =
                        Math.min(
                            musicPlayer.duration || Infinity,
                            musicPlayer.currentTime +
                            (details.seekOffset || 10)
                        );

                    saveMusicPlayerState();
                }
            );

        } catch (error) {

            console.warn(
                "Media controls error:",
                error
            );
        }
    }
}


/* BUTTON EVENTS */

if (previousButton) {

    previousButton.addEventListener(
        "click",
        playPreviousSong
    );
}


if (nextButton) {

    nextButton.addEventListener(
        "click",
        playNextSong
    );
}


if (playPauseButton) {

    playPauseButton.addEventListener(
        "click",
        async () => {

            if (!musicPlayer) return;

            if (musicPlayer.paused) {

                if (
                    currentSongIndex >= 0 &&
                    musicPlayer.src
                ) {

                    await musicPlayer.play();

                } else if (
                    currentPlaylist?.length
                ) {

                    await playSong(0);
                }

            } else {

                musicPlayer.pause();
            }
        }
    );
}


if (shuffleButton) {

    shuffleButton.addEventListener(
        "click",
        toggleShuffle
    );
}


if (repeatButton) {

    repeatButton.addEventListener(
        "click",
        toggleRepeat
    );
}


window.addEventListener(
    "beforeunload",
    saveMusicPlayerState
);


/* START */

initializeAudioPlayer();

initializeMusicPlayerV2();

updateShuffleButton();
updateRepeatButton();
updatePlayPauseButton();
updateSongButtons();


initializeMessageForm();

/* =========================================
   FAVORITE + DATE HELPERS
   ========================================= */
initializeMessageForm();
/* =========================================
   FAVORITE + DATE HELPERS
   ========================================= */

function formatMemoryDate(dateValue) {
    if (!dateValue) {
        return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleDateString(
        undefined,
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );
}


async function toggleMediaFavorite(id, currentValue) {
    try {
        requireSupabase();

        const { error } = await supabaseClient
            .from(MEDIA_TABLE)
            .update({
                is_favorite: !currentValue
            })
            .eq("id", id);

        if (error) {
            throw error;
        }

        showNotification(
            !currentValue
                ? "Added to favorites ❤️"
                : "Removed from favorites",
            "❤️"
        );

        await loadAllMemories();

    } catch (error) {
        console.error(
            "Favorite update error:",
            error
        );

        showNotification(
            "Could not update favorite.",
            "⚠️"
        );
    }
}


async function confirmDeleteMedia(item) {

    if (!item || !item.id) {
        return;
    }

    const confirmed = confirm(
        `Delete "${item.file_name}"?\n\nThis cannot be undone.`
    );

    if (!confirmed) {
        return;
    }

    const deleted =
        await deleteMedia(item);

    if (deleted) {
        showNotification(
            "Memory deleted.",
            "🗑️"
        );

        await loadAllMemories();
    }
}

/* =========================================
   LEON & MAJICA SETTINGS — PART 1
   ========================================= */

const SETTINGS_DEFAULTS = {
    siteTheme: "romantic",
    galleryLayout: "grid",
    animationsEnabled: true,
    homeMessage:
        "Every picture, every song, every message — a piece of us.",
    heroPhotoSource: "gallery",
    heroGalleryPhoto: "",
    heroBrightness: 75,
    heroPosition: "center",
    musicPlayerStyle: "classic",
    musicPlayerBackground: "default",
    musicArtworkUrl: "",
    confirmBeforeDelete: true,
    privateMessages: true
};

function getSettingsFormData() {
    const value = id =>
        document.getElementById(id);

    return {
        siteTheme: value("siteTheme")?.value || "romantic",
        galleryLayout: value("galleryLayout")?.value || "grid",
        animationsEnabled: value("animationsEnabled")?.checked ?? true,
        homeMessage: value("homeMessage")?.value || "",
        heroPhotoSource: value("heroPhotoSource")?.value || "gallery",
        heroGalleryPhoto: value("heroGalleryPhoto")?.value || "",
        heroBrightness: Number(value("heroBrightness")?.value || 75),
        heroPosition: value("heroPosition")?.value || "center",
        musicPlayerStyle: value("musicPlayerStyle")?.value || "classic",
        musicPlayerBackground:
            value("musicPlayerBackground")?.value || "default",
        musicArtworkUrl: value("musicArtworkUrl")?.value || "",
        confirmBeforeDelete:
            value("confirmBeforeDelete")?.checked ?? true,
        privateMessages: value("privateMessages")?.checked ?? true
    };
}

function fillSettingsForm(settings = {}) {
    const data = {
        ...SETTINGS_DEFAULTS,
        ...settings
    };

    const setValue = (id, val) => {
        const element = document.getElementById(id);
        if (element) element.value = val;
    };

    const setChecked = (id, val) => {
        const element = document.getElementById(id);
        if (element) element.checked = Boolean(val);
    };

    setValue("siteTheme", data.siteTheme);
    setValue("galleryLayout", data.galleryLayout);
    setChecked("animationsEnabled", data.animationsEnabled);
    setValue("homeMessage", data.homeMessage);
    setValue("heroPhotoSource", data.heroPhotoSource);
    setValue("heroGalleryPhoto", data.heroGalleryPhoto);
    setValue("heroBrightness", data.heroBrightness);
    setValue("heroPosition", data.heroPosition);
    setValue("musicPlayerStyle", data.musicPlayerStyle);
    setValue("musicPlayerBackground", data.musicPlayerBackground);
    setValue("musicArtworkUrl", data.musicArtworkUrl);
    setChecked("confirmBeforeDelete", data.confirmBeforeDelete);
    setChecked("privateMessages", data.privateMessages);

    updateHeroSourceControls();
    updateHeroPreview();
}

function updateHeroSourceControls() {
    const source =
        document.getElementById("heroPhotoSource")?.value;

    const galleryWrap =
        document.getElementById("heroGalleryPickerWrap");

    const uploadWrap =
        document.getElementById("heroUploadWrap");

    if (galleryWrap) {
        galleryWrap.hidden = source !== "gallery";
    }

    if (uploadWrap) {
        uploadWrap.hidden = source !== "upload";
    }
}


function updateHeroPreview() {
    const preview = document.getElementById("heroPreview");
    if (!preview) return;

    const brightness = Number(
        document.getElementById("heroBrightness")?.value || 75
    );

    const position =
        document.getElementById("heroPosition")?.value || "center";

    const source =
        document.getElementById("heroPhotoSource")?.value;

    let imageUrl = "";

    if (source === "upload") {
        const file =
            document.getElementById("heroPhotoUpload")?.files?.[0];

        if (file) {
            if (window._heroPreviewUrl) {
                URL.revokeObjectURL(window._heroPreviewUrl);
            }

            window._heroPreviewUrl = URL.createObjectURL(file);
            imageUrl = window._heroPreviewUrl;
        }
    } else {
        imageUrl =
            document.getElementById("heroGalleryPhoto")
                ?.selectedOptions?.[0]?.dataset?.imageUrl || "";
    }

    preview.style.backgroundPosition = position;
    preview.style.backgroundSize = "cover";
    preview.style.filter = `brightness(${brightness}%)`;

    if (imageUrl) {
        preview.style.backgroundImage = `url("${imageUrl}")`;
        preview.innerHTML = "";
    } else {
        preview.style.backgroundImage =
            "linear-gradient(135deg, #573642, #090909)";

        preview.innerHTML =
            "<span>Choose or upload a photo to preview ❤️</span>";
    }

    const applyButton = document.getElementById("previewHeroButton");

    if (applyButton) {
        applyButton.onclick = () => {
            const hero = document.querySelector(".hero-section");

            if (!hero || !imageUrl) {
                setSettingsStatus("Choose a photo first.");
                return;
            }

            hero.style.backgroundImage =
                `linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.25)), url("${imageUrl}")`;

            hero.style.backgroundPosition = position;
            hero.style.backgroundSize = "cover";
            hero.style.backgroundRepeat = "no-repeat";

            setSettingsStatus(
                "Hero background preview applied. Save/persistence is not connected yet."
            );
        };
    }
}

function setSettingsStatus(message) {
    const status =
        document.getElementById("settingsStatus");

    if (status) status.textContent = message;
}

function exportSettings() {
    const data = getSettingsFormData();

    const blob = new Blob(
        [JSON.stringify(data, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "leon-majica-settings.json";
    link.click();

    URL.revokeObjectURL(url);

    setSettingsStatus("Settings file exported.");
}

function importSettingsFile(file) {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
        try {
            const data = JSON.parse(reader.result);

            if (!data || typeof data !== "object" || Array.isArray(data)) {
                throw new Error("Invalid settings file.");
            }

            fillSettingsForm(data);
            setSettingsStatus(
                "Settings imported. Press Save Settings when saving is connected."
            );
        } catch (error) {
            console.error("Settings import error:", error);
            setSettingsStatus("Could not read that settings file.");
        }
    };

    reader.readAsText(file);
}

function initializeSettingsControls() {
    const source =
        document.getElementById("heroPhotoSource");

    source?.addEventListener(
        "change",
        updateHeroSourceControls
    );

    document.getElementById("heroBrightness")
        ?.addEventListener("input", updateHeroPreview);

    document.getElementById("heroPosition")
        ?.addEventListener("change", updateHeroPreview);

    document.getElementById("previewHeroButton")
        ?.addEventListener("click", updateHeroPreview);

    document.getElementById("resetHeroButton")
        ?.addEventListener("click", () => {
            const brightness =
                document.getElementById("heroBrightness");

            const position =
                document.getElementById("heroPosition");

            const sourceSelect =
                document.getElementById("heroPhotoSource");

            const galleryPhoto =
                document.getElementById("heroGalleryPhoto");

            if (brightness) brightness.value = 75;
            if (position) position.value = "center";
            if (sourceSelect) sourceSelect.value = "gallery";
            if (galleryPhoto) galleryPhoto.value = "";

            const preview =
                document.getElementById("heroPreview");

            if (preview) {
                preview.style.backgroundImage = "";
                preview.style.filter = "";
                preview.style.backgroundPosition = "center";
            }

            updateHeroSourceControls();
            updateHeroPreview();
            setSettingsStatus("Hero preview reset. Save to keep your settings.");
        });

    document.getElementById("exportSettingsButton")
        ?.addEventListener("click", exportSettings);

    document.getElementById("importSettingsButton")
        ?.addEventListener("click", () => {
            document.getElementById("importSettingsFile")?.click();
        });

    document.getElementById("importSettingsFile")
        ?.addEventListener("change", event => {
            importSettingsFile(event.target.files?.[0]);
            event.target.value = "";
        });

    fillSettingsForm();
}

/* =========================================
   MUSIC PLAYER PHOTO BACKGROUND
   ========================================= */

let musicBackgroundPreviewUrl = "";

async function loadMusicGalleryPhotos() {
    const select =
        document.getElementById("musicGalleryPhoto");

    if (!select) return;

    try {
        requireSupabase();

        const records = await getMediaRecords();

        select.innerHTML = "";

        const photos = (records || []).filter(item =>
            item.file_type === "photo" ||
            item.file_type === "image" ||
            (item.mime_type || "").startsWith("image/")
        );

        if (!photos.length) {
            select.add(new Option("No gallery photos found", ""));
            updateMusicBackgroundPreview();
            return;
        }

        select.add(new Option("Choose a photo...", ""));

        for (const photo of photos) {
            const url = await getSignedUrl(photo.file_path);

            if (!url) continue;

            const option = new Option(
                photo.file_name || "Gallery photo",
                photo.file_path
            );

            option.dataset.imageUrl = url;

            select.add(option);
        }

        updateMusicBackgroundPreview();

    } catch (error) {
        console.error("Could not load music background photos:", error);
        select.innerHTML = "";
        select.add(new Option("Could not load gallery photos", ""));
    }
}

function updateMusicBackgroundSource() {
    const source =
        document.getElementById("musicPhotoSource")?.value;

    const galleryWrap =
        document.getElementById("musicGalleryPickerWrap");

    const uploadWrap =
        document.getElementById("musicUploadPickerWrap");

    if (galleryWrap) {
        galleryWrap.hidden = source !== "gallery";
    }

    if (uploadWrap) {
        uploadWrap.hidden = source !== "upload";
    }

    updateMusicBackgroundPreview();
}

function updateMusicBackgroundPreview() {
    const preview =
        document.getElementById("musicBackgroundPreview");

    if (!preview) return;

    const brightness = Number(
        document.getElementById("musicBrightness")?.value || 75
    );

    const source =
        document.getElementById("musicPhotoSource")?.value;

    let imageUrl = "";

    if (source === "upload") {
        const file =
            document.getElementById("musicBackgroundUpload")
                ?.files?.[0];

        if (file) {
            if (musicBackgroundPreviewUrl) {
                URL.revokeObjectURL(musicBackgroundPreviewUrl);
            }

            musicBackgroundPreviewUrl =
                URL.createObjectURL(file);

            imageUrl = musicBackgroundPreviewUrl;
        }
    } else {
        imageUrl =
            document.getElementById("musicGalleryPhoto")
                ?.selectedOptions?.[0]?.dataset?.imageUrl || "";
    }

    preview.style.filter = `brightness(${brightness}%)`;
    preview.style.backgroundSize = "cover";
    preview.style.backgroundPosition = "center";

    if (imageUrl) {
        preview.style.backgroundImage =
            `url("${imageUrl}")`;

        preview.innerHTML = "";
    } else {
        preview.style.backgroundImage =
            "linear-gradient(135deg, #573642, #090909)";

        preview.innerHTML =
            "<span>Select a gallery photo or upload your own ❤️</span>";
    }
}

function initializeMusicBackgroundSettings() {
    document.getElementById("musicPhotoSource")
        ?.addEventListener("change", updateMusicBackgroundSource);

    document.getElementById("musicGalleryPhoto")
        ?.addEventListener("change", updateMusicBackgroundPreview);

    document.getElementById("musicBackgroundUpload")
        ?.addEventListener("change", updateMusicBackgroundPreview);

    document.getElementById("musicBrightness")
        ?.addEventListener("input", updateMusicBackgroundPreview);

    document.getElementById("previewMusicBackgroundButton")
        ?.addEventListener("click", updateMusicBackgroundPreview);

    document.getElementById("resetMusicBackgroundButton")
        ?.addEventListener("click", () => {
            const source =
                document.getElementById("musicPhotoSource");

            const gallery =
                document.getElementById("musicGalleryPhoto");

            const upload =
                document.getElementById("musicBackgroundUpload");

            const brightness =
                document.getElementById("musicBrightness");

            const style =
                document.getElementById("musicPlayerBackground");

            if (source) source.value = "gallery";
            if (gallery) gallery.value = "";
            if (upload) upload.value = "";
            if (brightness) brightness.value = 75;
            if (style) style.value = "default";

            updateMusicBackgroundSource();
            updateMusicBackgroundPreview();
        });

    loadMusicGalleryPhotos();
}

/* =========================================
   LOAD PHOTOS FOR HERO BACKGROUND
   ========================================= */

async function loadHeroGalleryPhotos() {
    const select = document.getElementById("heroGalleryPhoto");
    if (!select) return;

    try {
        const records = await getMediaRecords();

        select.innerHTML = "";
        select.add(new Option("Choose a photo...", ""));

        const photos = (records || []).filter(item =>
            item.file_type === "photo" ||
            item.file_type === "image" ||
            (item.mime_type || "").startsWith("image/")
        );

        for (const photo of photos) {
            const url = await getSignedUrl(photo.file_path);
            if (!url) continue;

            const option = new Option(
                photo.file_name || "Gallery photo",
                photo.file_path
            );

            option.dataset.imageUrl = url;
            select.add(option);
        }

        updateHeroPreview();

    } catch (error) {
        console.error("Hero gallery loading error:", error);
        select.innerHTML = "";
        select.add(new Option("Could not load photos", ""));
    }
}

/* =========================================
   ENTIRE WEBSITE BACKGROUND
   ========================================= */

async function loadSiteBackgroundGallery() {
    const select = document.getElementById("siteBackgroundPhoto");
    if (!select) return;

    try {
        const records = await getMediaRecords();

        select.innerHTML = "";
        select.add(new Option("Choose a photo...", ""));

        const photos = (records || []).filter(item =>
            item.file_type === "photo" ||
            item.file_type === "image" ||
            (item.mime_type || "").startsWith("image/")
        );

        for (const photo of photos) {
            const url = await getSignedUrl(photo.file_path);
            if (!url) continue;

            const option = new Option(
                photo.file_name || "Gallery photo",
                photo.file_path
            );

            option.dataset.imageUrl = url;
            select.add(option);
        }

        updateSiteBackgroundPreview();

    } catch (error) {
        console.error("Website background gallery error:", error);
        select.innerHTML = "";
        select.add(new Option("Could not load photos", ""));
    }
}

function updateSiteBackgroundSource() {
    const source =
        document.getElementById("siteBackgroundSource")?.value;

    const galleryWrap =
        document.getElementById("siteGalleryPickerWrap");

    const uploadWrap =
        document.getElementById("siteUploadPickerWrap");

    if (galleryWrap) galleryWrap.hidden = source !== "gallery";
    if (uploadWrap) uploadWrap.hidden = source !== "upload";

    updateSiteBackgroundPreview();
}

function updateSiteBackgroundPreview() {
    const preview =
        document.getElementById("siteBackgroundPreview");

    if (!preview) return;

    const source =
        document.getElementById("siteBackgroundSource")?.value;

    const brightness = Number(
        document.getElementById("siteBackgroundBrightness")?.value || 45
    );

    let imageUrl = "";

    if (source === "upload") {
        const file =
            document.getElementById("siteBackgroundUpload")
                ?.files?.[0];

        if (file) {
            if (window._siteBackgroundPreviewUrl) {
                URL.revokeObjectURL(window._siteBackgroundPreviewUrl);
            }

            window._siteBackgroundPreviewUrl =
                URL.createObjectURL(file);

            imageUrl = window._siteBackgroundPreviewUrl;
        }
    } else {
        imageUrl =
            document.getElementById("siteBackgroundPhoto")
                ?.selectedOptions?.[0]?.dataset?.imageUrl || "";
    }

    preview.style.filter = `brightness(${brightness}%)`;
    preview.style.backgroundSize = "cover";
    preview.style.backgroundPosition = "center";

    if (imageUrl) {
        preview.style.backgroundImage = `url("${imageUrl}")`;
        preview.innerHTML = "";
    } else {
        preview.style.backgroundImage =
            "linear-gradient(135deg, #573642, #090909)";

        preview.innerHTML =
            "<span>Choose a gallery photo or upload your own ❤️</span>";
    }
}

function initializeSiteBackgroundSettings() {
    document.getElementById("siteBackgroundSource")
        ?.addEventListener("change", updateSiteBackgroundSource);

    document.getElementById("siteBackgroundPhoto")
        ?.addEventListener("change", updateSiteBackgroundPreview);

    document.getElementById("siteBackgroundUpload")
        ?.addEventListener("change", updateSiteBackgroundPreview);

    document.getElementById("siteBackgroundBrightness")
        ?.addEventListener("input", updateSiteBackgroundPreview);

    document.getElementById("previewSiteBackgroundButton")
        ?.addEventListener("click", async () => {

            updateSiteBackgroundPreview();

            const source =
                document.getElementById("siteBackgroundSource")?.value;

            const brightness =
                Number(
                    document.getElementById("siteBackgroundBrightness")?.value || 45
                );

            let imageUrl = "";
            let backgroundPath = "";

            try {

                /*
                 * GALLERY PHOTO
                 */
                if (source === "gallery") {

                    const photoSelect =
                        document.getElementById("siteBackgroundPhoto");

                    backgroundPath =
                        photoSelect?.value || "";

                    imageUrl =
                        photoSelect
                            ?.selectedOptions?.[0]
                            ?.dataset?.imageUrl || "";

                    if (!backgroundPath || !imageUrl) {
                        setSettingsStatus(
                            "Choose a website background photo first."
                        );
                        return;
                    }
                }

                /*
                 * NEW UPLOAD
                 */
                else if (source === "upload") {

                    const uploadInput =
                        document.getElementById("siteBackgroundUpload");

                    const file =
                        uploadInput?.files?.[0];

                    if (!file) {
                        setSettingsStatus(
                            "Choose a photo to upload first."
                        );
                        return;
                    }

                    setSettingsStatus(
                        "Uploading website background..."
                    );

                    const record =
                        await uploadMediaFile(
                            file,
                            "photo"
                        );

                    if (!record?.file_path) {
                        throw new Error(
                            "Background upload did not return a file path."
                        );
                    }

                    backgroundPath =
                        record.file_path;

                    imageUrl =
                        await getSignedUrl(
                            backgroundPath
                        );

                    if (!imageUrl) {
                        throw new Error(
                            "Could not create a signed URL for the background."
                        );
                    }
                }

                /*
                 * SAVE SETTINGS
                 */
                await saveSiteBackgroundSettings(
                    backgroundPath,
                    source,
                    brightness
                );

                /*
                 * APPLY BACKGROUND
                 */
                const darkness =
                    1 - brightness / 100;

                document.body.style.backgroundImage =
                    `linear-gradient(
                        rgba(0,0,0,${darkness}),
                        rgba(0,0,0,${darkness})
                    ), url("${imageUrl}")`;

                document.body.style.backgroundSize =
                    "cover";

                document.body.style.backgroundPosition =
                    "center";

                document.body.style.backgroundAttachment =
                    "fixed";

                document.body.style.backgroundRepeat =
                    "no-repeat";

                setSettingsStatus(
                    "Website background saved successfully."
                );

            } catch (error) {

                console.error(
                    "Website background save error:",
                    error
                );

                setSettingsStatus(
                    "Could not save website background: " +
                    (error?.message || "Unknown error.")
                );
            }

        });

    document.getElementById("resetSiteBackgroundButton")
        ?.addEventListener("click", () => {

            const source =
                document.getElementById("siteBackgroundSource");

            const photo =
                document.getElementById("siteBackgroundPhoto");

            const upload =
                document.getElementById("siteBackgroundUpload");

            const brightness =
                document.getElementById("siteBackgroundBrightness");

            if (source) source.value = "gallery";
            if (photo) photo.value = "";
            if (upload) upload.value = "";
            if (brightness) brightness.value = 45;

            document.body.style.backgroundImage = "";
            document.body.style.backgroundSize = "";
            document.body.style.backgroundPosition = "";
            document.body.style.backgroundAttachment = "";
            document.body.style.backgroundRepeat = "";

            updateSiteBackgroundSource();

            setSettingsStatus(
                "Website background reset for this page."
            );
        });

    loadSiteBackgroundGallery();
}
