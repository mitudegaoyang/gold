import React, { useState, useEffect } from 'react';
import {
  Form,
  Select,
  DatePicker,
  Button,
  // InputNumber,
  // Switch,
  // Slider,
  // Rate,
  Typography,
  Space,
  Divider,
  Badge,
  Row,
  Col
} from 'antd';
import { Wcontainer, Wline } from '@alicloud/cloud-charts';
import moment from 'moment';
import axios from 'axios';
import './App.less';
import logo from './logo.png';
import codeEnum from './data/codeEnum.json';
import typeEnum from './data/typeEnum.json';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title } = Typography;

const initValues = { brand: 'cb', type: 'gold', date: [moment().subtract(1, 'month'), moment()] };
let options = {
  // stack: true,
  // // size: 30,
  // column: false,
  // legend: false,
  // padding: [10, 20, 30, 85],
  // legend: {
  //   position: 'right',
  //   align: 'center',
  // },
  colors: ['#438BF7', '#00C5D0', '#F8B821', '#F2627B'],
  xAxis: {
    type: 'time',
    mask: 'YYYY-MM-DD',
    customConfig: {
      label: {
        style: {
          fontSize: 14,
          fill: '#575D6C'
        }
      }
    }
  },
  yAxis: {
    customConfig: {
      // grid: null,
      line: {
        style: {
          stroke: '#E4E7ED'
        }
      },
      label: {
        style: {
          fontSize: 14,
          fill: '#575D6C'
        }
      }
    }
  },
  tooltip: {
    reactContent: (title, data) => {
      return (
        <div className="customTooltip">
          <div className="toolTitle">{title}</div>
          <Space direction="vertical">
            {data.map((item) => {
              return (
                <div key={item?.name} className="toolContent">
                  <div>
                    <Badge color={item.color} text={item.name} />：{item.value}
                  </div>
                  <div className="toolRatio">
                    {item?.data?.extra[0] ? `${item?.data?.extra[0]}` : '-'}
                  </div>
                </div>
              );
            })}
          </Space>
        </div>
      );
    }
  }
  // label: {
  //   'position': 'middle'
  // }
};

const App = () => {
  const [form] = Form.useForm();
  const [initialValues, setInitialValues] = useState({});
  const [data, setData] = useState(null);
  const [brand, setBrand] = useState('cb');
  const [canRender, setCanRander] = useState(false);
  let goldList = [
    {
      name: '趋势图',
      data: []
    }
  ];
  // 金投网
  // http://quote.cngold.org/gjs/swhj_cb.html
  // 新浪财经
  // https://vip.stock.finance.sina.com.cn/q//view/vGold_Matter_History.php?page=1&pp=5&pz=11&start=2022-01-01&end=2022-12-31

  const getData = (param) => {
    let startDate = moment(param.date[0]).format('YYYY-MM-DD');
    let endDate = moment(param.date[1]).format('YYYY-MM-DD');
    param.code = codeEnum[param.brand]['codes'][param.type];
    let url = `https://api.jijinhao.com/quoteCenter/history.htm?style=3&needField=128,129,70&pageSize=999&currentPage=1&code=${param.code}&startDate=${startDate}&endDate=${endDate}`;

    axios.get(url).then((res) => {
      let str = res.data;
      let data = new Function('return ' + str.split('=')[1])();
      // console.log(data);
      goldList[0].name = data.productName;
      goldList[0].data = formarData(data).map((item) => {
        return [item.time, item.price, item.priceDis];
      });
      setData(goldList);
      // console.log(JSON.stringify(goldList));
    });
  };

  const formarData = (data) => {
    return data.data.reverse().map((item) => {
      let obj = {
        time: item.time,
        timeStr: new Date(item.time).toLocaleDateString(),
        name: '菜百',
        productName: data.productName,
        price: item.q1,
        unit: data.unit,
        d2: '-',
        d3: '另计',
        priceDis: item.q70 > 0 ? '涨' : item.q70 < 0 ? '跌' : '平'
      };
      return obj;
    });
  };

  const onChange = (values) => {
    setBrand(values.brand);
    form.setFieldValue('type', Object.keys(codeEnum[values.brand].codes)[0]);
  };

  const onSubmit = async (values) => {
    getData(values);
  };

  const onReset = () => {
    form.resetFields();
    onSubmit(initValues);
  };

  useEffect(() => {
    setInitialValues(initValues);
    onSubmit(initValues);
    setCanRander(true);
  }, []);

  if (!canRender) {
    return null;
  }

  return (
    <>
      <section style={{ textAlign: 'center', marginTop: 48, marginBottom: 40 }}>
        <Space align="start">
          <img style={{ width: 40, height: 40 }} src={logo} alt="Ant Design" />
          <Title level={2} style={{ marginBottom: 0 }}>
            贵金属走势
          </Title>
        </Space>
      </section>
      <Divider style={{ marginBottom: 60 }}>Form</Divider>
      <Form
        form={form}
        // labelCol={{ span: 4 }}
        // wrapperCol={{ span: 20 }}
        initialValues={initialValues}
        onValuesChange={(changedValues, allValues) => {
          if (Object.keys(changedValues)[0] === 'brand') {
            onChange(allValues);
          }
        }}
        onFinish={onSubmit}
      >
        <Row gutter={20}>
          <Col xs={24} sm={24} md={12} lg={12} xl={6} xxl={6}>
            <Form.Item
              label="品牌"
              name="brand"
              rules={[{ required: true, message: '请选择品牌!' }]}
            >
              <Select style={{ width: 192 }}>
                {Object.keys(codeEnum).map((item, index) => {
                  if (index > 6) {
                    return null;
                  }
                  return (
                    <Option value={item} key={item}>
                      {codeEnum[item].name}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12} lg={12} xl={6} xxl={6}>
            <Form.Item
              label="类型"
              name="type"
              rules={[{ required: true, message: '请选择类型!' }]}
            >
              <Select style={{ width: 192 }}>
                {Object.keys(codeEnum[brand].codes).map((item, index) => {
                  return (
                    <Option value={item} key={item}>
                      {typeEnum[item]}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12} lg={12} xl={6} xxl={6}>
            <Form.Item
              label="起止日期"
              name="date"
              rules={[{ required: true, message: '请输入起止日期!' }]}
            >
              <RangePicker
                disabledDate={(current) => {
                  return current && current > moment();
                }}
              />
            </Form.Item>
          </Col>
        </Row>
        {/* <Form.Item label="数字输入框">
          <InputNumber min={1} max={10} defaultValue={3} />
          <span className="ant-form-text"> 台机器</span>
          <a href="https://ant.design">链接文字</a>
        </Form.Item>
        <Form.Item label="开关">
          <Switch defaultChecked />
        </Form.Item>
        <Form.Item label="滑动输入条">
          <Slider defaultValue={70} />
        </Form.Item>
        <Form.Item label="日期范围选择框">
          <DatePicker.RangePicker />
        </Form.Item>
        <Form.Item label="评分">
          <Rate defaultValue={5} />
        </Form.Item> */}
        <Form.Item wrapperCol={{ span: 8, offset: 8 }}>
          <Space>
            <Button type="primary" htmlType="submit">
              搜索
            </Button>
            <Button onClick={onReset}>重置</Button>
          </Space>
        </Form.Item>
      </Form>
      <Wcontainer style={{ padding: '0 20px' }} className="eduNumDistribute">
        <Row gutter={10}>
          <Col span={22} offset={1}>
            <Wline height="300" config={options} data={data} />
          </Col>
        </Row>
      </Wcontainer>
    </>
  );
};

export default App;
