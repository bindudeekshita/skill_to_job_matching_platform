const API_BASE_URL = "http://localhost:4000/api";

async function api(path, options = {}) {
const headers = {
...(options.body !== undefined
? { "Content-Type": "application/json" }
: {}),
...options.headers,
};

const config = {
...options,
headers,
};

if (
options.body !== undefined &&
typeof options.body !== "string" &&
!(options.body instanceof FormData)
) {
config.body = JSON.stringify(options.body);
}

let response;

try {
response = await fetch(`${API_BASE_URL}${path}`, config);
} catch {
throw new Error(
"Cannot connect to the backend. Start Spring Boot on port 4000."
);
}

const contentType = response.headers.get("content-type") || "";
let data = null;

if (contentType.includes("application/json")) {
data = await response.json();
} else {
const text = await response.text();
data = text || null;
}

if (!response.ok) {
const message =
data && typeof data === "object" && data.message
? data.message
: typeof data === "string" && data
? data
: `Request failed with status ${response.status}`;

```
throw new Error(message);
```

}

return data;
}

export { api };
export default api;
