def get_risk_level(region, frequency):
    high_risk_regions = ["West Bengal", "Odisha", "Assam", "Bihar", "Jharkhand"]
    medium_risk_regions = ["Maharashtra", "Karnataka", "UP", "MP"]

    if region in high_risk_regions and frequency > 100:
        return "🔥 Extreme Risk"
    elif region in medium_risk_regions and frequency > 80:
        return "⚠️ High Risk"
    elif frequency > 60:
        return "⚡ Moderate Risk"
    else:
        return "✅ Low Risk"
