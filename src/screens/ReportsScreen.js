import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { getSessions } from '../services/storage';

const { width } = Dimensions.get('window');

export default function ReportsScreen() {
  const [stats, setStats] = useState({
    todayFocus: 0,
    totalFocus: 0,
    totalDistractions: 0
  });
  const [chartData, setChartData] = useState({
    weekly: { labels: [], datasets: [{ data: [] }] },
    categories: []
  });

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const data = await getSessions();
    calculateStats(data);
  };

  const calculateStats = (data) => {
    const today = new Date().toDateString();
    let todayFocus = 0;
    let totalFocus = 0;
    let totalDistractions = 0;
    const categoryMap = {};
    const last7DaysMap = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = d.toLocaleDateString('tr-TR', { weekday: 'short' });
      last7DaysMap[dayName] = 0;
    }

    data.forEach(item => {
      const itemDate = new Date(item.date);
      
      totalFocus += item.duration;
      totalDistractions += item.distractions;
      if (itemDate.toDateString() === today) {
        todayFocus += item.duration;
      }

      if (categoryMap[item.category]) {
        categoryMap[item.category] += item.duration;
      } else {
        categoryMap[item.category] = item.duration;
      }

      const dayDiff = (new Date() - itemDate) / (1000 * 60 * 60 * 24);
      if (dayDiff <= 7) {
        const dayName = itemDate.toLocaleDateString('tr-TR', { weekday: 'short' });
        if (last7DaysMap[dayName] !== undefined) {
          last7DaysMap[dayName] += item.duration / 60;
        }
      }
    });

    const pieColors = ['#e74c3c', '#3498db', '#f1c40f', '#2ecc71', '#9b59b6'];
    const pieData = Object.keys(categoryMap).map((cat, index) => ({
      name: cat,
      population: Math.round(categoryMap[cat] / 60), 
      color: pieColors[index % pieColors.length],
      legendFontColor: "#7f8c8d",
      legendFontSize: 12
    }));

    const barLabels = Object.keys(last7DaysMap);
    const barValues = Object.values(last7DaysMap);

    setStats({ todayFocus, totalFocus, totalDistractions });
    setChartData({
      weekly: { labels: barLabels, datasets: [{ data: barValues }] },
      categories: pieData
    });
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}sa ${m}dk` : `${m}dk`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      <Text style={styles.headerTitle}>İstatistikler</Text>

      <View style={styles.summaryContainer}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Bugün</Text>
          <Text style={styles.cardValue}>{formatTime(stats.todayFocus)}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Toplam</Text>
          <Text style={styles.cardValue}>{formatTime(stats.totalFocus)}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Bölünme</Text>
          <Text style={[styles.cardValue, { color: 'tomato' }]}>{stats.totalDistractions}</Text>
        </View>
      </View>

      <Text style={styles.chartTitle}>Son 7 Gün (Dakika)</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <BarChart
          data={chartData.weekly}
          width={width + 50}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(231, 76, 60, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          style={styles.chart}
        />
      </ScrollView>

      <Text style={styles.chartTitle}>Kategori Dağılımı</Text>
      {chartData.categories.length > 0 ? (
        <PieChart
          data={chartData.categories}
          width={width - 20}
          height={220}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          absolute
        />
      ) : (
        <Text style={styles.noDataText}>Henüz veri yok.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 20, marginTop: 30 },
  summaryContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  card: { backgroundColor: '#fff', width: '30%', padding: 15, borderRadius: 15, alignItems: 'center', elevation: 3 },
  cardLabel: { fontSize: 12, color: '#7f8c8d', marginBottom: 5 },
  cardValue: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  chartTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10, marginTop: 10 },
  chart: { borderRadius: 16, marginVertical: 8 },
  noDataText: { textAlign: 'center', color: '#999', marginTop: 20, fontStyle: 'italic' }
});