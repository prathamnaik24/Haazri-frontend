# Haazri Mobile Handoff Context

This handoff document provides core context, design systems, routing structures, and API behaviors extracted from the Haazri Web frontend. Use this as your reference architecture to build the React Native application using **Expo** and **NativeWind (Tailwind CSS for React Native)**.

---

## 1. Design System (Tailwind to NativeWind)

The mobile app must maintain visual continuity with the web application. Below are the key color palettes, spacing variables, and border properties.

### Color Palette Reference

| Color Name | Hex Code | Web Variable | NativeWind Utility | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Brand Primary (Blue)** | `#1677B8` | `--color-primary` | `bg-[#1677B8]` / `text-[#1677B8]` | Buttons, Active tabs, Brand text |
| **Brand Accent (Light Blue)**| `#57B9FF` | `--color-accent` | `bg-[#57B9FF]` / `text-[#57B9FF]` | Sub-highlights, secondary buttons |
| **Primary Navy (Dark)** | `#172B3A` | `--color-navy` | `text-[#172B3A]` / `bg-[#172B3A]` | Header text, body titles |
| **Slate Gray (Text)** | `#526B7A` | `--color-slate` | `text-[#526B7A]` | Subtitles, label captions |
| **Border Gray** | `#D7E6EF` | `--color-border` | `border-[#D7E6EF]` | Card borders, input separators |
| **Card Background** | `#FFFFFF` | `--color-white` | `bg-white` | Card container background |
| **App Background** | `#EBF4FF` | `--color-bg-light` | `bg-[#EBF4FF]` | Primary background behind cards |

### Spacing & Borders

*   **Card Container style:**
    *   **Border Radius:** `12px` (NativeWind: `rounded-xl` or `rounded-[12px]`)
    *   **Border:** `1px solid #D7E6EF` (NativeWind: `border border-[#D7E6EF]`)
    *   **Padding:** `18px 20px` (NativeWind: `px-5 py-4.5` or `p-5`)
    *   **Shadow:** `0 1px 3px rgba(81, 120, 145, 0.08)` (Use React Native `shadow` properties or custom iOS/Android elevation wrapper)
*   **Form Input style:**
    *   **Border Radius:** `8px` (NativeWind: `rounded-lg`)
    *   **Border:** `1px solid #D7E6EF` (NativeWind: `border border-[#D7E6EF]`)
    *   **Padding:** `10px 14px` (NativeWind: `px-3.5 py-2.5`)
    *   **Background:** `#FFFFFF` (NativeWind: `bg-white`)
*   **Button Radius:** `8px` (NativeWind: `rounded-lg`)

---

## 2. Component Translation

Rebuild the core user interfaces following these structural summaries:

### Component A: The Primary Button (`primaryBtn`)
*   **Web Code Base:** [`styles.js`](file:///Users/shajo/Haazri-Workspace/frontend/Haazri-frontend/src/components/ui/styles.js#L61-L74)
*   **Structure:**
    ```jsx
    <TouchableOpacity className="flex-row items-center justify-center bg-[#1677B8] px-4 py-2.5 rounded-lg active:opacity-80">
      {icon && <IconComponent />}
      <Text className="text-white text-[13px] font-semibold">{title}</Text>
    </TouchableOpacity>
    ```
*   **Key Behavior:** Handles disabled state and displays indicator when asynchronously submitting forms.

### Component B: Attendance Status Card (`CheckInWidget`)
*   **Web Code Base:** [`EmployeeDashboard.jsx:L20-135`](file:///Users/shajo/Haazri-Workspace/frontend/Haazri-frontend/src/pages/employee/EmployeeDashboard.jsx#L20-L135)
*   **Structure:**
    *   **Card Container:** Rendered as a `bg-white border border-[#D7E6EF] rounded-xl p-5 mb-5` layout.
    *   **Header Section:** Welcome greeting based on current time (e.g. "Good morning, [Name] 👋") plus the long formatted date string below it.
    *   **Time Display (Live Clock):** Huge bold clock in the center showing standard digital time (`HH:MM:SS`). If checked in, display "Working time: HH:MM:SS" showing active duration since `check_in_time`.
    *   **Footer Status & Button:**
        *   Left side: Small color-coded status dot (green when checked in, gray when checked out) alongside text status indicator.
        *   Right side: Pressable checkout button (`Check Out` styled with red background `#FEE2E2` and red text `#DC2626` when active, or `Check In` styled with primary blue `#1677B8` and white text).
    *   **Logic:**
        *   Calls `GET /attendance/me?limit=1` on load. Checks if a check-in exists for today with no check-out time.
        *   Triggers `POST /attendance/check-in` or `POST /attendance/check-out` respectively.

### Component C: Leave Request Form Modal
*   **Web Code Base:** [`MyLeave.jsx:L185-250`](file:///Users/shajo/Haazri-Workspace/frontend/Haazri-frontend/src/pages/employee/MyLeave.jsx#L185-L250)
*   **Structure:**
    *   **Container:** Centered modal card or a full screen form view.
    *   **Input Fields:**
        *   *Leave Type Picker:* Select drop-down dynamically populated from `/leaves/types`.
        *   *Start Date & End Date:* Date pickers (standard native calendar modal on iOS/Android).
        *   *Reason:* Multiline text-input area for reason context.
    *   **Action Button Group:**
        *   Cancel Button: Reverts state and dismisses modal.
        *   Submit Button: Triggers `POST /leaves/request` with parameters `leave_type_id`, `start_date`, `end_date`, and `reason`. Shows status spinner while loading.

---

## 3. Navigation & Routing Map

Map the web URL structure to a modern tab-based or stack navigation system using **React Navigation** or **Expo Router**:

### Suggested Mobile Navigation Structure
```
RootStack (Switch based on Authentication Token status)
├── AuthStack (If token is absent/invalid)
│   ├── PortalSelector (Welcome screen selecting Login Route)
│   ├── EmployeeLogin (Route: /employee-login)
│   └── AdminOrgLogin (Route: /login)
└── AppTabs (If token is validated successfully)
    ├── HomeTab (Switch based on user role parsed from decoded JWT token)
    │   ├── EmployeeDashboardStack
    │   │   └── EmployeeDashboard (Main view)
    │   ├── ManagerDashboardStack
    │   │   └── ManagerDashboard (Main view with team statuses)
    │   └── AdminDashboardStack
    │       └── AdminDashboard (Admin panel)
    ├── AttendanceTab (MyAttendance screen & attendance history list)
    ├── LeaveTab (MyLeave screen & active leave request submissions)
    └── MoreSettingsTab
        ├── Screen: Profile (Edit profile and view roles)
        ├── Screen: TeamAttendance (Manager only: view subordinate checkins)
        ├── Screen: LeaveApprovals (Manager/Admin: approve leave requests)
        └── Action: Logout (Clear SecureStore token and reset to AuthStack)
```

---

## 4. Auth & State Handshake

The application relies on JWT authentication tokens stored on the client. Rebuild this behavior on mobile using Secure Storage.

### Token Acquisition
*   Login endpoint: `POST /api/auth/employee/login` or `POST /api/auth/org/login`
*   Response Payload format:
    ```json
    {
      "status": "success",
      "data": {
        "tokens": {
          "accessToken": "<JWT_STRING>",
          "refreshToken": "<JWT_STRING>"
        }
      }
    }
    ```

### Secure Storage Mechanism
*   **Web Frontend Storage:** Local Storage (`localStorage.setItem('token', accessToken)`).
*   **Mobile equivalent:** Replicate this secure handshake using `expo-secure-store`.
    *   Save: `SecureStore.setItemAsync('authToken', accessToken)`
    *   Retrieve: `SecureStore.getItemAsync('authToken')`
    *   Delete: `SecureStore.deleteItemAsync('authToken')`

### API Headers Setup
Every request made from the mobile application must hook into the token pipeline. Structure your axios instance to attach the auth header:

```javascript
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
  baseURL: 'http://localhost:5001/api', // Update to LAN IP for local testing on physical devices
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Deciphering User Roles
The mobile client must parse the base64 payload segment of the JWT token to determine user roles and dynamically restrict or serve screens (e.g., hiding/showing manager options). Refer to the decoding utility from [`auth.js`](file:///Users/shajo/Haazri-Workspace/frontend/Haazri-frontend/src/utils/auth.js#L29-L46):

*   **Role Logic mapping:**
    *   If `user.type === 'org_admin'` or decoded roles contains `'org admin'`: set role as `org_admin`.
    *   If decoded roles contain supervisor keywords (`manager`, `supervisor`, `hr`, `lead`): set role as `manager`.
    *   Otherwise: default role to `employee`.
