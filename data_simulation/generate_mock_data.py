import json
import os
import random
import math
from datetime import datetime, timedelta
from faker import Faker

# Setup Arabic Faker
fake = Faker(['ar_SA', 'en_US'])

def generate_mock_data():
    """
    Generates realistic mock data for ManasaDigital platform.
    """
    # Use simple characters for console output to avoid Windows encoding issues
    print("Starting realistic data generation for ManasaDigital...")
    
    # Paths
    base_dir = "mock_data"
    os.makedirs(base_dir, exist_ok=True)
    
    # 1. Generate Users (Roles: SELLER 60%, BUYER 35%, ADMIN 5%)
    num_users = 100
    users = []
    roles = ['SELLER'] * 60 + ['BUYER'] * 35 + ['ADMIN'] * 5
    random.shuffle(roles)
    
    for i in range(num_users):
        role = roles[i]
        # Generate Arabic name, but ensure email looks realistic and linked to name
        name = fake['ar_SA'].name()
        email_base = name.replace(" ", ".").lower()
        # English email format
        email = f"{fake['en_US'].user_name()}@{fake['en_US'].free_email_domain()}"
        
        users.append({
            "id": f"user_{i+1}",
            "name": name,
            "email": email,
            "role": role,
            "created_at": (datetime.now() - timedelta(days=random.randint(60, 365))).isoformat()
        })

    # 2. Generate Digital Products (Pareto Principle: 20% Stars, 30% Good, 50% Average)
    num_products = 40
    products = []
    sellers = [u["id"] for u in users if u["role"] == "SELLER"]
    
    if not sellers:
        # Fallback if no sellers generated
        sellers = ["user_1"]

    categories = ["E-Book", "Course", "Template", "Software", "Graphics", "Audio"]
    
    # Rank products for sales probability later
    product_ranks = list(range(num_products))
    random.shuffle(product_ranks)
    
    for i in range(num_products):
        rank = product_ranks[i]
        # Pareto categorization
        if i < int(0.2 * num_products):
            tier = "STAR"
            sales_multiplier = random.uniform(5, 10)
        elif i < int(0.5 * num_products):
            tier = "GOOD"
            sales_multiplier = random.uniform(1.5, 4.5)
        else:
            tier = "NORMAL"
            sales_multiplier = random.uniform(0.1, 1.2)

        products.append({
            "id": f"prod_{i+1}",
            "title": fake['ar_SA'].catch_phrase(),
            "category": random.choice(categories),
            "price": round(random.uniform(10, 500), 2),
            "seller_id": random.choice(sellers),
            "tier": tier,
            "sales_multiplier": sales_multiplier
        })

    # 3. Generate Sales (60 Days, Exponential Growth + Weekend Boost + Spikes)
    sales = []
    start_date = datetime.now() - timedelta(days=60)
    buyers = [u["id"] for u in users if u["role"] == "BUYER"]
    
    if not buyers:
        buyers = ["user_100"]

    total_revenue = 0
    best_day_revenue = 0
    best_day = None

    for day_offset in range(61):
        current_date = start_date + timedelta(days=day_offset)
        
        # Exponential growth base: e^(0.03 * x)
        base_sales_count = int(5 * math.exp(0.025 * day_offset))
        
        # Weekend Boost (Friday/Saturday/Sunday - depends on region, we'll use Fri/Sat for MENA)
        weekday = current_date.weekday()
        multiplier = 1.0
        if weekday in [4, 5]: # Friday, Saturday
            multiplier = random.uniform(1.3, 1.8)
            
        # Random Spike (2% chance)
        if random.random() < 0.02:
            multiplier *= random.uniform(3, 5)
            print(f"Sudden traffic spike detected on {current_date.date()}!")

        # Gaussian Noise
        daily_count = int(max(0, random.gauss(base_sales_count * multiplier, 2)))
        
        day_revenue = 0
        for _ in range(daily_count):
            # Select product based on sales_multiplier (weighted choice)
            prod = random.choices(products, weights=[p["sales_multiplier"] for p in products])[0]
            
            sale_amount = prod["price"]
            sales.append({
                "id": f"sale_{len(sales)+1}",
                "product_id": prod["id"],
                "buyer_id": random.choice(buyers),
                "amount": sale_amount,
                "timestamp": (current_date + timedelta(hours=random.randint(0, 23), minutes=random.randint(0, 59))).isoformat()
            })
            day_revenue += sale_amount
            total_revenue += sale_amount

        if day_revenue > best_day_revenue:
            best_day_revenue = day_revenue
            best_day = current_date.strftime("%Y-%m-%d")

    # 4. Save Files
    try:
        with open(os.path.join(base_dir, "users.json"), "w", encoding="utf-8") as f:
            json.dump(users, f, ensure_ascii=False, indent=4)
            
        with open(os.path.join(base_dir, "products.json"), "w", encoding="utf-8") as f:
            # Remove internal sales_multiplier before saving
            clean_products = [{k: v for k, v in p.items() if k != "sales_multiplier"} for p in products]
            json.dump(clean_products, f, ensure_ascii=False, indent=4)
            
        with open(os.path.join(base_dir, "sales.json"), "w", encoding="utf-8") as f:
            json.dump(sales, f, ensure_ascii=False, indent=4)
            
        summary = {
            "platform_name": "ManasaDigital",
            "total_users": len(users),
            "total_products": len(products),
            "total_sales_records": len(sales),
            "total_revenue": round(total_revenue, 2),
            "currency": "USD",
            "best_day": best_day,
            "best_day_revenue": round(best_day_revenue, 2),
            "generation_date": datetime.now().isoformat()
        }
        
        with open(os.path.join(base_dir, "summary.json"), "w", encoding="utf-8") as f:
            json.dump(summary, f, ensure_ascii=False, indent=4)

        print("\nData Generation Complete!")
        print(f"Location: {os.path.abspath(base_dir)}")
        print(f"Summary:")
        print(f"   - Users: {summary['total_users']}")
        print(f"   - Products: {summary['total_products']}")
        print(f"   - Revenue: ${summary['total_revenue']:,}")
        print(f"   - Peak Day: {summary['best_day']} (${summary['best_day_revenue']:,})")
        
    except Exception as e:
        print(f"Error saving data: {e}")

if __name__ == "__main__":
    generate_mock_data()
