!macro customInstall
    SetShellVarContext current
    !define ROAMING_FOLDER_ROOT "$APPDATA\beat-saver-client"
    CreateDirectory ${ROAMING_FOLDER_ROOT}
    CopyFiles $INSTDIR\db.sqlite3 ${ROAMING_FOLDER_ROOT}
!macroend