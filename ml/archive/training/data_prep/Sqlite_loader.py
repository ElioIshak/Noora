import pandas as pd
import sqlite3 as sql

con = sql.connect(r"C:\Users\Elio\Desktop\Calmi~Calmy\Calmi\Data\Go_Emotions\final\final_data.db")
data = pd.read_sql_query('SELECT * FROM data_merged', con)

data_frame = pd.DataFrame(data)
data_frame.to_csv(r"C:\Users\Elio\Desktop\Calmi~Calmy\Calmi\Data\Go_Emotions\final\Final_Data.csv", index=False)
