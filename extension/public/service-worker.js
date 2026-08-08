function enableActionSidePanel() {
  return chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
}

chrome.runtime.onInstalled.addListener(() => {
  void enableActionSidePanel()
})

chrome.runtime.onStartup.addListener(() => {
  void enableActionSidePanel()
})

void enableActionSidePanel()
