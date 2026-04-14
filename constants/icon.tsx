import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";

export const icon = {
  index: (props: any) => <Feather name="home" size={24} {...props} />,
  stats: (props: any) => <Ionicons name="stats-chart" size={24} {...props} />,
  add: (props: any) => <Feather name="plus" size={24} {...props} />,
  meds: (props: any) => (
    <MaterialIcons name="medication" size={24} {...props} />
  ),
  profile: (props: any) => <Feather name="user" size={24} {...props} />,
};
