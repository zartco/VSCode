// crt-phosphor.hlsl — Windows Terminal pixel shader
// Effects: CRT scanlines · phosphor green tint · edge vignette
//
// Tune the three constants below to taste:
//   0.0 = effect off,  higher = stronger
//
// Apply via settings.json profiles.defaults:
//   "experimental.pixelShaderPath": "C:\\VSCode\\shaders\\crt-phosphor.hlsl"

Texture2D    shaderTexture : register(t0);
SamplerState samplerState  : register(s0);

cbuffer PixelShaderSettings {
    float  Time;
    float  Scale;
    float2 Resolution;
    float4 Background;
};

static const float SCANLINE_STRENGTH = 0.18;   // 0–0.40  (try 0.0 first to verify shader works)
static const float PHOSPHOR_TINT     = 0.25;   // 0–1.0   (green channel boost)
static const float VIGNETTE_STRENGTH = 0.9;    // 0–3.0   (edge darkening)

float4 main(float4 pos : SV_Position, float2 tex : TEXCOORD) : SV_Target
{
    float4 color = shaderTexture.Sample(samplerState, tex);

    // -- Scanlines --------------------------------------------------------
    // sin() creates one wave per pixel row.  Raising to a power softens the
    // dark bands so they look like phosphor strips, not hard lines.
    float scan = sin(tex.y * Resolution.y * 3.14159265f) * 0.5f + 0.5f;
    color.rgb  *= lerp(1.0f - SCANLINE_STRENGTH, 1.0f, pow(scan, 0.6f));

    // -- Phosphor tint ----------------------------------------------------
    // Real P31 phosphor (Matrix green) emits more green than red/blue.
    float3 tinted = float3(color.r * 0.85f, color.g * 1.05f, color.b * 0.75f);
    color.rgb = lerp(color.rgb, tinted, PHOSPHOR_TINT);

    // -- Vignette ---------------------------------------------------------
    // dot(v,v) = squared distance from center; increases toward corners.
    float2 v  = tex - 0.5f;
    color.rgb *= saturate(1.0f - dot(v, v) * VIGNETTE_STRENGTH);

    return color;
}
