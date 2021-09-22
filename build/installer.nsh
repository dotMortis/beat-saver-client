!macro customInstall
    SetShellVarContext current
    !define ROAMING_FOLDER_ROOT "$APPDATA\beat-saver-client"
    CreateDirectory ${ROAMING_FOLDER_ROOT}
    CopyFiles ${BUILD_RESOURCES_DIR}\db.sqlite3 ${ROAMING_FOLDER_ROOT}
    Delete ${BUILD_RESOURCES_DIR}\db.sqlite3
!macroend