import { View, Text, ScrollView } from "react-native";
import { COLORS } from "@/src/styles/colors";

export default function TermsPrivacyScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16, color: COLORS.PRIMARY }}>
          Về SEN
        </Text>
        
        <Text style={{ fontSize: 16, lineHeight: 28, marginBottom: 24, color: "#333", textAlign: 'justify' }}>
          Chào mừng bạn đến với <Text style={{fontWeight: 'bold', color: COLORS.PRIMARY}}>SEN</Text> - Ứng dụng khám phá và tôn vinh Di sản Văn hóa Việt Nam.
          {"\n"}
          SEN không chỉ là một lăng kính số soi chiếu hàng ngàn năm lịch sử, mà còn là một <Text style={{fontWeight: 'bold'}}>trò chơi giáo dục tương tác</Text>, 
          nơi bạn nhập vai, khám phá và giải mã những câu chuyện hào hùng của ông cha.
          {"\n\n"}
          Với sứ mệnh <Text style={{fontWeight: 'bold'}}>truyền bá và lan tỏa niềm yêu thích lịch sử</Text>, chúng tôi kết hợp công nghệ hiện đại với kho tàng văn hóa đồ sộ, 
          biến việc <Text style={{fontWeight: 'bold', color: COLORS.PRIMARY}}>học lịch sử</Text> trở nên sống động, lôi cuốn và đầy cảm hứng ngay trên thiết bị của bạn.
        </Text>

        <View style={{ height: 1, backgroundColor: "#EEEEEE", marginBottom: 24 }} />

        <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16, color: COLORS.PRIMARY }}>
          Đội ngũ phát triển
        </Text>

        <View style={{ gap: 16 }}>
             {[
               { name: "Nguyễn Tiến Tuấn", phone: "0945650883", email: "tuannguyentien16@gmail.com" },
                { name: "Nguyễn Văn Hiếu", phone: "0917579522", email: "nguyenhieu32005@gmail.com" },
                { name: "Phan Thị Thu Nguyệt", phone: "0389829196", email: "phanthithunguyet628@gmail.com" },
                { name: "Trần Thành Duy", phone: "0866028877", email: "dandythenubit@gmail.com" },
                { name: "Bùi Thị Yến", phone: "0389829196", email: "buiyen2004yen@gmail.com" }
             ].map((member, index) => (
                 <View key={index} style={{ backgroundColor: "#FAFAFA", padding: 16, borderRadius: 12 }}>
                     <Text style={{ fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 4 }}>{member.name}</Text>
                     <Text style={{ fontSize: 14, color: "#666" }}>📞 {member.phone}</Text>
                     <Text style={{ fontSize: 14, color: "#666" }}>✉️ {member.email}</Text>
                 </View>
             ))}
        </View>

        <Text style={{ fontSize: 14, color: "#999", textAlign: "center", marginTop: 40, marginBottom: 20 }}>
          Phiên bản 1.0.0 - Made with ❤️ by Team SEN
        </Text>
      </View>
    </ScrollView>
  );
}