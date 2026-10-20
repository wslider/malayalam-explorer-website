import pandas as pd
import geopandas as gpd 
import json
import xyzservices.providers as xyz
import matplotlib.pyplot as plt
import contextily as cx

from pathlib import Path


LOCATIONS_PATH = Path("../data/locations.json")

def create_locations_map():

    loc_df = pd.read_json(LOCATIONS_PATH)

    # Keep all columns
    full_loc_gdf = gpd.GeoDataFrame(
        loc_df,
        geometry=gpd.points_from_xy(loc_df.lon, loc_df.lat),
        crs="EPSG:4326",
    )

    # Reproject to Web Mercator (best for tile alignment / sharpness)
    full_loc_web_merc = full_loc_gdf.to_crs(epsg=3857)

    # Plot – GeoPandas handles the basemap automatically
    ax = full_loc_web_merc.plot(
        figsize=(10, 10),
        alpha=1,
        edgecolor="black",
        color="red",
        markersize=100,
        tiles=xyz.OpenTopoMap,   
    )

    fig = ax.figure

    minx, miny, maxx, maxy = full_loc_web_merc.total_bounds
    pad_x = (maxx - minx) * 0.3
    pad_y = (maxy - miny) * 0.3


    ax.set_xlim(minx - pad_x, maxx + pad_x)
    ax.set_ylim(miny - pad_y, maxy + pad_y)

    # Styling
    fig.patch.set_facecolor("black")          # background around the map
    ax.set_title("Locations", color="white")   # white title
    ax.set_axis_off()

    map_dir = Path("../maps")
    map_dir.mkdir(parents=True, exist_ok=True)
    out = map_dir / f"locations_map.png"
    fig.savefig(out, dpi=300, bbox_inches="tight", facecolor=fig.get_facecolor())
    print(f"Saved {out}")

if __name__ == "__main__":
    create_locations_map()
else:
    print("Executed when imported")