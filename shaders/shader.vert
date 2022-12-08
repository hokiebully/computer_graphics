#version 450

layout(binding = 0) uniform UniformBufferObject {
    mat4 model;
    mat4 view;
    mat4 proj;
    int mode;
    vec3 specular_color;
    int specular_exp;
    float ambient_intensity;
    vec3 light_color;
    vec4 eye_light;
} ubo;

layout(location = 0) in vec3 inPosition;
layout(location = 1) in vec3 inNormal;
layout(location = 2) in vec3 inColor;
layout(location = 3) in vec2 inTexCoord;
layout(location = 4) in ivec2 inTexMapID;
layout(location = 5) in int inGroupID;

layout(location = 1) out vec3 fragColor;
layout(location = 2) out vec2 fragTexCoord;
layout(location = 3) out ivec2 fragTexMapID;
layout(location = 4) out int fragGroupID;
layout(location = 5) out vec4 fragEyeView;
layout(location = 6) out vec4 fragEyeNormal;

void main() {
    gl_Position = ubo.proj * ubo.view * ubo.model * vec4(inPosition, 1.0);
    vec4 eye_view = -normalize(ubo.view * ubo.model * vec4(inPosition, 1.));
    vec4 eye_normal = normalize(ubo.view *  ubo.model * vec4(inNormal, 0.));

    // Output
    fragColor = inColor;
    fragTexCoord = inTexCoord;
    fragTexMapID = inTexMapID;
    fragGroupID = inGroupID;

    fragEyeView = eye_view;
    fragEyeNormal = eye_normal;
}