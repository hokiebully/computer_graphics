#version 450

layout(location = 1) in vec3 fragColor;
layout(location = 2) in vec2 fragTexCoord;
layout(location = 3) flat in ivec2 fragTexMapID;
layout(location = 4) flat in int fragGroupID;
layout(location = 5) in vec4 fragEyeView;
layout(location = 6) in vec4 fragEyeNormal;

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

layout(binding = 1) uniform sampler2D texSampler0;
layout(binding = 2) uniform sampler2D texSampler1;
layout(binding = 3) uniform sampler2D texSampler2;
layout(binding = 4) uniform sampler2D texSampler3;
layout(binding = 5) uniform sampler2D texSampler4;
layout(binding = 6) uniform sampler2D texSampler5;
layout(binding = 7) uniform sampler2D texSampler6;
layout(binding = 8) uniform sampler2D texSampler7;

layout(location = 0) out vec4 outColor;

vec2 minMaxScaler(float x, float y, float aX, float bX, float aY, float bY)
{
  float minX = 0.358074;
  float maxX = 0.877582;
  float minY = 0.493527;
  float maxY = 0.817669;

  float newX = aX + (x - minX) * (bX - aX) / (maxX - minX);
  float newY = aY + (y - minY) * (bY - aY) / (maxY - minY);
  return vec2(newX, newY);
}

vec3 checkerBoard()
{
  // Grid texture in *texture* coordinates
  vec2 ftc = vec2(fragTexCoord.x, 1.0 - fragTexCoord.y);
  float gridSize = 0.07;
  vec2 pos = floor(ftc / gridSize);
  float mask = mod(pos.x + mod(pos.y, 2.0), 2.0);
  return mask * fragColor;
  // float offset = mod(floor(ftc / gridSize).y, 2.) * 0.07;
  // vec2 factors = step(gridStep, fract((ftc  + vec2(offset, 0.))/ gridSize));
  // return factors.x * factors.y * color;
}

vec3 getBaseColor(int index, int dim)
{
    vec2 ftc = vec2(fragTexCoord.x, 1.0 - fragTexCoord.y);
    vec3 color;
    if (dim == 0) {
        // Specular
        color = ubo.specular_color;
    }
    else {
        // Diffuse
        color =  fragColor;
    }

    if (index == 0)
        return texture(texSampler0, ftc).rgb;
    else if (index == 1)
        return texture(texSampler1, ftc).rgb;
    else if (index == 2)
        return texture(texSampler2, ftc).rgb;
    else if (index == 3)
        return texture(texSampler3, ftc).rgb;
    else if (index == 4)
        return texture(texSampler4, ftc).rgb;
    else if (index == 5)
        return texture(texSampler5, ftc).rgb;
    else if (index == 6)
        return texture(texSampler6, ftc).rgb;
    else if (index == 7)
        return texture(texSampler7, ftc).rgb;
    else
        return color;
  
}

void main() {

    int currMode = ubo.mode;
    vec3 diffuse_base;
    vec3 specular_base;

    vec3 ambient;
    vec3 diffuse = vec3(0., 0., 0.);
    vec3 specular = vec3(0., 0., 0.);
    vec4 eye_light = normalize(ubo.eye_light);

    if (currMode > 1) {
        diffuse_base = getBaseColor(fragTexMapID[1], 1);
        specular_base = getBaseColor(fragTexMapID[0], 0);
        if (fragGroupID == 2) {
            // Roof fragment (Roof is groupID == 2)
            if (currMode > 2) {
                // Flags
                float minX = (currMode - 3) * 0.2;
                vec2 ftc1 = minMaxScaler(fragTexCoord.x, fragTexCoord.y, minX, minX + 0.2, 0.0, 1.0);
                vec2 ftc2 = vec2(ftc1.x, 1.0 - ftc1.y);
                diffuse_base = texture(texSampler7, ftc2).rgb;
            }
        }
    } else {
        diffuse_base = fragColor;
        specular_base = ubo.specular_color;
        if (currMode == 1 && fragGroupID == 2)
            diffuse_base = checkerBoard();
    }

    // Get ambient component
    ambient = ubo.ambient_intensity * diffuse_base;

    // Get diffuse and specular components
    float ldotn = dot(eye_light, fragEyeNormal);
    if(ldotn > 0.)
    {
      diffuse = ldotn * ubo.light_color * diffuse_base;
      float rdotv = dot(reflect(-eye_light, fragEyeNormal), fragEyeView);
      if(rdotv > 0.)
        specular = ubo.light_color * specular_base * pow(rdotv, ubo.specular_exp);
    }

    outColor = vec4(ambient + diffuse + specular, 1.0);

    // outColor = vec4(fragColor, 1.0);
    // outColor = texture(texSampler, fragTexCoord);
    // outColor = getBaseColor(fragTexMapID[1], 1);
}