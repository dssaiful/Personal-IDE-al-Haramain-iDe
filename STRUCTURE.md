# Autonomous IDE: Application Structure Overview

This document provides a full structure view of the "LocalAIDE" Autonomous IDE, including all activated core system features.

## 1. Top Layout Hierarchy
- **Top Menu Bar**: Application controls (File, Edit, Selection, View, Go, Debug, Terminal, Help), window controls (Minimize, Maximize, Close), and "Health" status indicator.
- **Main Container**: Flex layout dividing the Sidebar and the Editor/Chat area.
- **Bottom Status Bar**: Real-time project metrics, language mode, line/col, and git branch status.

## 2. Activity Bar (Far Left)
The vertical strip for quick-navigation between sub-agents and views:
- **Explorer**: File management and directory traversal.
- **Search**: Global text search across all project files.
- **Source Control**: Git integration, commit history, and push-to-local functionality.
- **Run & Debug**: Process management for dev servers and compilers.
- **Extensions**: Marketplace and installed plugins.
- **Health (Stability Engine)**: Real-time autonomous debugging logs and system hardware metrics.
- **Settings**: AI configuration, build/distribution options, and system versioning.

## 3. Secondary Sidebar (Dynamic Content)
Renders content based on the selected Activity Bar tab:
- **Explorer View**: Tree-view of `/src`, `/electron`, and `/backend`. Supports right-click context menus.
- **Search View**: High-speed indexing with "Recent Searches" history.
- **Stability Engine**: Interactive console showing 4-pillar hardware telemetry (CPU, RAM, Latency, Uptime) and a live activity stream.
- **Settings View**:
    - **Inference Engine**: Toggle between Gemini, DeepSeek, or localized models.
    - **Distribution**: One-click "EXPORT AS LOCAL EXE" (bundles dependencies via `electron-builder`).

## 4. Main Editor Workspace (Center)
- **Editor**: Deeply integrated Microsoft Monaco Editor (VS Code core).
    - **IntelliSense**: Powered by local AI suggestions.
    - **Predictive Edits**: Highlighted diffs applied autonomously by the stability engine.
- **Tabs**: Quick switching between open files with unsaved change indicators.

## 5. Chat Interface (Bottom Right overlay)
- **Agent Interaction**: Natural language interface for building and fixing code.
- **Multimodal Support**: Paste images, drag-and-drop attachments.
- **Status Indicator**: Shows the current model being used and the "Executing Locally" confirmation.

## 6. Build & Distribution System
- **Engine**: `electron-builder`
- **Target**: Standalone `.exe` for Windows x64.
- **Packaging**: Automatically bundles `dist/`, `electron/`, and `backend/` along with all production dependencies.

---
*Status: All features core-activated. Application is ready for local deployment and distribution.*
